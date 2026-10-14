# Auditoria rápida de usabilidade — Tatuagem no smartphone

**Data:** 12/10/2026  
**Recorte:** formulário e caminho mínimo até o resultado, em Chrome com emulação de iPhone 14 (390 × 844 px CSS; DPR 3). Inspeção automatizada de uma sessão local; não substitui teste com pessoas.

## Métricas observadas

| Medida | Resultado |
|---|---:|
| Campos configurados no formulário | 11 |
| Campos obrigatórios / opcionais | 1 / 10 |
| Altura total da página | 1.274 px CSS (430 px além da primeira tela) |
| Campos e seletores avaliados | 12 áreas de toque com 40 px de altura |
| Barra fixa inferior | 74 px de altura; ocupa y=754–828 na tela de 844 px |
| Prévia flutuante | 195 × 52 px em x=187, y=112; cruza a área do título |
| Caminho mínimo testado | 2 ações: informar complexidade 5 e tocar em “Calcular” |
| Resultado do caminho mínimo | R$ 0,00 |

## Problemas e melhorias propostas

1. **A prévia de preço cobre o cabeçalho.** No estado inicial, ela mostra “--” e sobrepõe o título e a instrução do formulário. Trocar o snackbar por uma prévia em fluxo, abaixo do cabeçalho, ou mostrá-la apenas depois de haver um valor calculável.
2. **A barra fixa encobre o início da seção de taxas.** Ela ocupa os últimos 74 px da tela; o seletor de taxa começa em y=786 e fica parcialmente sob a barra. Reservar espaço inferior igual à barra mais a área segura do aparelho e garantir que o último campo focado possa rolar acima dela.
3. **O cálculo mínimo termina em zero.** “Complexidade” é o único campo obrigatório, mas o cálculo de mão de obra depende de sessões × horas por sessão. Com esses campos vazios, ambos viram zero e o resultado observado é R$ 0,00. Exigir as horas/sessões necessárias ou mostrar uma validação explicando como obter um preço útil antes de habilitar o cálculo.
4. **A ação principal é apenas um ícone.** “Calcular” existe como nome acessível, mas a barra oculta os rótulos. Exibir “Calcular preço” no botão principal e manter “Voltar” visível.
5. **Os campos ocupam uma tela longa sem separar o que é essencial.** Dez dos 11 campos são opcionais, mas aparecem juntos. Agrupar em etapas curtas (“Trabalho”, “Tempo”, “Custos”) e recolher custos opcionais; marcar explicitamente os opcionais e indicar unidades, por exemplo “Tamanho (cm)”.
6. **Alvos de formulário estão abaixo de uma referência confortável para toque.** As 12 áreas de campo e seleção medidas têm 40 px de altura. Aumentá-las para pelo menos 44–48 px, preservando espaçamento entre controles.

## Evidência e limite

O caminho mínimo foi exercitado sem salvar dados. O cálculo de tatuagem confirma que a mão de obra é baseada em valor-hora × sessões × horas por sessão, explicando o zero quando esses valores não são informados. A captura da primeira tela está em [tattoo-mobile-review.png](../tattoo-mobile-review.png).

Esta é uma avaliação heurística de um único fluxo e tamanho de viewport. Não mede taxa de sucesso, tempo de conclusão com usuários reais, uso de teclado virtual nem diferenças entre aparelhos físicos.
