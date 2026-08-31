import type {
  CalculatorConfig,
} from "../types";

export const tattooCalculator: CalculatorConfig = {
  id: "tattoo",
  name: "Tatuagem",
  description:
    "Calcule um preço sugerido para seu trabalho.",
  fields: [
    {
      id: "sizeCm",
      label: "Tamanho",
      type: "number",
      required: false,
      min: 0,
      step: 0.5,
    },

    {
      id: "bodyPart",
      label: "Parte do corpo",
      type: "select",
      required: false,

      options: [
        {
          id: "arm",
          label: "Braço",
        },
        {
          id: "forearm",
          label: "Antebraço",
        },
        {
          id: "hand",
          label: "Mão",
        },
        {
          id: "leg",
          label: "Perna",
        },
        {
          id: "thigh",
          label: "Coxa",
        },
        {
          id: "foot",
          label: "Pé",
        },
        {
          id: "back",
          label: "Costas",
        },
        {
          id: "chest",
          label: "Peito",
        },
        {
          id: "ribs",
          label: "Costela",
        },
        {
          id: "neck",
          label: "Pescoço",
        },
        {
          id: "face",
          label: "Rosto",
        },
      ],
    },

    {
      id: "design",
      label: "Tipo de desenho",
      type: "select",
      required: false,

      options: [
        {
          id: "ready",
          label: "Desenho pronto",
        },
        {
          id: "original",
          label: "Desenho original",
        },
        {
          id: "adjustment",
          label: "Projeto de ajuste",
        },
      ],
    },

    {
      id: "style",
      label: "Cores e acabamento",
      type: "select",
      required: false,

      options: [
        {
          id: "black",
          label: "Apenas preto",
        },
        {
          id: "black-shading",
          label: "Preto + sombreado",
        },
        {
          id: "color",
          label: "Colorida",
        },
        {
          id: "black-and-color",
          label: "Preto + colorido",
        },
      ],
    },

    {
      id: "materials",
      label: "Custo com materiais",
      type: "currency",
      required: false,
      min: 0,
      step: 0.01,
    },

    {
      id: "hourlyRate",
      label: "Valor da sua hora",
      type: "currency",
      required: false,
      min: 0,
      step: 0.01,
    },

    {
      id: "sessions",
      label: "Número de sessões",
      type: "number",
      required: false,
      min: 0,
      step: 1,
    },

    {
      id: "hoursPerSession",
      label: "Horas por sessão",
      type: "number",
      required: false,
      min: 0,
      step: 0.5,
    },

    {
      id: "indirectCosts",
      label: "Custos indiretos",
      type: "currency",
      required: false,
      min: 0,
      step: 0.01,
    },

    {
      id: "fees",
      label: "Taxas",
      type: "fee-list",
      required: false,
    },

    {
      id: "profitMargin",
      label: "Margem de lucro",
      type: "percentage",
      required: false,
      min: 0,
      max: 100,
      step: 1,
    },
  ],
};
