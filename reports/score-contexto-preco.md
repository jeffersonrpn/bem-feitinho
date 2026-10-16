# Relatório: score de contexto para preços

## Objetivo

Estimar quão acima ou abaixo do histórico está o preço-base de um projeto em relação a projetos semelhantes do mesmo usuário. O score é um z-score, em desvios padrão. Ele não é uma propriedade intrínseca de “tatuagem de 20 cm na coxa”: depende dos preços históricos encontrados para os atributos preenchidos.

O formulário recalculará a vizinhança e o score quando qualquer campo mudar. O histórico será carregado uma vez para a calculadora ativa; não haverá consulta ao banco a cada tecla.

## Dados e população

- Consultar apenas cálculos salvos do usuário autenticado, com o mesmo `calculator_id`, moeda BRL e `calculator_version` compatível.
- Usar `input_snapshot` para atributos e `suggested_total` para preços comparáveis. Não usar `adjusted_total`, pois ele contém decisões manuais que não representam necessariamente o cálculo-base.
- Não misturar tatuagem e crochê, nem consultar dados de outros usuários. A leitura ocorrerá no servidor e continuará sujeita à RLS existente.
- Excluir custos, taxas e margem de lucro da distância entre projetos: são decisões econômicas e já alteram o preço-base atual. Ainda assim, qualquer mudança nesses campos recalcula o preço-base e, portanto, o z-score resultante.

## Atributos de semelhança

Proposta inicial, com pesos iguais entre os campos considerados:

| Calculadora | Atributos que definem semelhança |
| --- | --- |
| Tatuagem | Tamanho, complexidade, parte do corpo, tipo de desenho, estilo, número de sessões e horas por sessão |
| Crochê | Tamanho, complexidade, tipo de projeto, estilo e tempo total |

Somente campos preenchidos no formulário atual participam da distância. Um campo opcional vazio não conta como diferença. Se um registro histórico não tiver um valor de que a comparação atual precisa, ele só poderá ser usado se cobrir pelo menos 80% do peso dos campos comparáveis; a distância será normalizada pela cobertura conhecida. Isso evita tratar “não informado” como se fosse igual ou diferente sem evidência.

## Distância proposta

Cada contribuição fica entre 0 e 1:

- Categoria: 0 quando igual e 1 quando diferente.
- Número: `d = min(|atual - histórico| / max(|atual|, |histórico|, escala_mínima_do_campo), 1)`. A escala mínima vem da configuração do campo e impede divisão por zero; o limite 1 impede que uma diferença extrema domine toda a comparação.
- Distância entre projetos: `D = sqrt(sum(peso_j * d_j²) / sum(peso_j))`, usando somente contribuições conhecidas e normalizando pela cobertura.

Sugestão para iniciar: peso 1 por atributo; selecionar no máximo os 10 menores valores de `D`, aceitando apenas `D <= 0,45`. A métrica precisa ser validada com exemplos reais anonimizados ou fixtures antes de congelar esses parâmetros. O limiar e os pesos devem ficar configuráveis por calculadora, não espalhados pela interface.

## Score e calibração

Para os preços sugeridos `p_i` dos pares selecionados, calcular:

`média = μ = soma(p_i) / n`

`desvio amostral = s = sqrt(soma((p_i - μ)²) / (n - 1))`

`score = z = (preço_base_atual - μ) / s`

Assim, `z > 0` indica preço-base acima da média dos pares e `z < 0`, abaixo. A proposta é exigir pelo menos 3 pares e `s > 0`; caso contrário, score indisponível e preço-base sem ajuste. Não remover outliers inicialmente, pois projetos caros podem ser legítimos; o relatório exibido deve informar média e quantidade de pares para dar contexto ao resultado.

Para calibrar sem substituir bruscamente a regra atual, proponho `α = 0,25`:

`preço_sugerido = preço_base + α * (μ - preço_base)`

Isso percorre um quarto da distância até a média dos pares. Com `α = 0`, o histórico só informa o score; com `α = 1`, o preço passa a ser a média histórica. A interface deve identificar o ajuste e mostrar o score, a média de referência e a quantidade de projetos usados. Um preço ajustado manualmente continua separado e não é sobrescrito.

A sugestão calibrada não poderá ficar abaixo do subtotal de custos calculado pela engine: `preço_sugerido = max(subtotal, preço_base + α * (μ - preço_base))`. Assim, o contexto histórico nunca reduz o valor abaixo do custo operacional. Se a consulta do histórico falhar, o cálculo continua com o preço-base, marca o score como indisponível e informa a falha; não bloqueia o salvamento.

## Exemplos concretos

### Tatuagem de 20 cm na coxa

Considere um formulário válido com tamanho 20 cm e parte do corpo “coxa”; complexidade, sessões e horas também estão preenchidas e entram na comparação. Suponha que os três pares mais próximos tenham preços sugeridos de R$ 180, R$ 200 e R$ 220. A média é R$ 200 e o desvio amostral é R$ 20. Se o preço-base atual for R$ 220:

`z = (220 - 200) / 20 = +1`

O score é exatamente `+1`, ou um desvio padrão acima da média dos semelhantes. Com `α = 0,25`, a sugestão calibrada é `220 + 0,25 * (200 - 220) = R$ 215`.

Esse exemplo explicita uma distinção importante: “20 cm na coxa” não determina sozinho que o score seja `+1`. O valor `+1` ocorre porque, neste exemplo, o preço-base é R$ 220 e os preços dos pares têm média R$ 200 e desvio R$ 20. Se o preço-base fosse R$ 200, o score seria zero; se os pares tivessem todos o mesmo preço, o desvio seria zero e não haveria score definido.

### Recalcular após mudar um atributo

Ao selecionar estilo colorido, a vizinhança deve ser recalculada. Suponha que os novos pares tenham preços de R$ 200, R$ 220 e R$ 240: média R$ 220 e desvio amostral R$ 20. Se o novo preço-base for R$ 260, `z = (260 - 220) / 20 = +2`, e com `α = 0,25` a sugestão fica em R$ 250. O score e a sugestão mudam sem nova chamada de rede.

### Crochê

Para três pares de crochê com preços de R$ 140, R$ 160 e R$ 180, a média é R$ 160 e o desvio amostral é R$ 20. Um preço-base atual de R$ 180 tem `z = +1`; com `α = 0,25`, a sugestão calibrada é R$ 175. Esses pares nunca incluem tatuagens.

### Sem evidência suficiente

Com zero, um ou dois pares, nenhum preço dentro do limite de distância, cobertura histórica abaixo de 80%, ou desvio amostral zero, exibir “histórico insuficiente para calcular o score” e manter o preço-base atual. Se a própria consulta ao histórico falhar, exibir que o histórico não pôde ser consultado e também manter o preço-base.

## Apresentação e persistência

No preview, apresentar score com sinal e uma casa decimal, por exemplo “Score +1,0 · 1 desvio acima da média”; junto, informar “Referência: R$ 200,00 · 3 projetos”. Para score indisponível, não mostrar zero como se fosse evidência neutra. Persistir no `result_snapshot` o preço-base, o preço calibrado, score, média, desvio, quantidade de pares, parâmetros/versão da regra e motivo de indisponibilidade. Cálculos antigos, sem esses metadados, continuam válidos e não exibem score.

## Riscos e decisões para aprovação

1. **Sentido da calibração:** preço-base acima da média dos semelhantes produz score positivo e, com a fórmula proposta, reduz o preço em direção à média. Isso assume que “calibrar” significa aproximar do histórico, não premiar projetos acima da média. Confirmar essa interpretação.
2. **Semelhança:** pesos iguais, distância relativa para números, limite `0,45`, no máximo 10 vizinhos e cobertura mínima de 80% são valores iniciais, não verdades estatísticas. Validar se os pares que eles selecionam parecem realmente semelhantes.
3. **Poucos dados e versões:** mínimo de 3 pares e desvio amostral são escolhas explícitas. Mudanças futuras de fórmulas devem incrementar `calculator_version` para não comparar resultados incompatíveis.
4. **Dados incompletos:** a política de cobertura reduz uso de snapshots antigos que não têm certos campos, mas pode tornar o score indisponível para formulários com muitos atributos preenchidos.
5. **Outliers:** manter todos os pares preserva preços legítimos atípicos, mas pode influenciar média e desvio. Não aplicar remoção automática sem regra aprovada.

## Critérios de aceitação propostos

- As duas calculadoras calculam o score com sua própria população de histórico e os atributos documentados.
- A alteração de qualquer campo recalcula preço, vizinhança e score no cliente após o histórico ser carregado.
- O resultado informa a quantidade e a média usadas, ou explica por que o score está indisponível.
- Sem histórico suficiente, o preço atual permanece igual ao preço-base anterior à funcionalidade.
- Histórico de outro usuário, outra calculadora, outra moeda ou versão incompatível nunca participa da comparação.
- O usuário pode avaliar os exemplos e parâmetros deste relatório antes de qualquer alteração nas engines, ações, formulário ou banco.
