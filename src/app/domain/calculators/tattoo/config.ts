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
      multiplier: {
        type: "linear",
        base: 1,
        step: 0.05,
        referenceValue: 1,
      },
    },

    {
      id: "complexity",
      label: "Complexidade do trabalho (1 a 10)",
      type: "number",
      required: true,
      min: 1,
      max: 10,
      step: 1,
      multiplier: {
        type: "linear",
        base: 1,
        step: 0.1,
        referenceValue: 1,
      },
    },

    {
      id: "bodyPart",
      label: "Parte do corpo",
      type: "select",
      required: false,
      options: [
        {
          id: "arm",
          multiplier: 1,
          label: "Braço",
        },
        {
          id: "forearm",
          multiplier: 1,
          label: "Antebraço",
        },
        {
          id: "hand",
          multiplier: 1.25,
          label: "Mão",
        },
        {
          id: "leg",
          multiplier: 1,
          label: "Perna",
        },
        {
          id: "thigh",
          multiplier: 1,
          label: "Coxa",
        },
        {
          id: "foot",
          multiplier: 1.25,
          label: "Pé",
        },
        {
          id: "back",
          multiplier: 1.1,
          label: "Costas",
        },
        {
          id: "chest",
          multiplier: 1.1,
          label: "Peito",
        },
        {
          id: "ribs",
          multiplier: 1.25,
          label: "Costela",
        },
        {
          id: "neck",
          multiplier: 1.25,
          label: "Pescoço",
        },
        {
          id: "face",
          multiplier: 1.5,
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
          multiplier: 1,
          label: "Desenho pronto",
        },
        {
          id: "original",
          multiplier: 1.25,
          label: "Desenho original",
        },
        {
          id: "adjustment",
          multiplier: 1.1,
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
          multiplier: 1,
          label: "Apenas preto",
        },
        {
          id: "black-shading",
          multiplier: 1.15,
          label: "Preto + sombreado",
        },
        {
          id: "color",
          multiplier: 1.25,
          label: "Colorida",
        },
        {
          id: "black-color",
          multiplier: 1.3,
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
      multiplier: {
        type: "margin",
        percentageBase: 100,
      },
    },
  ],
};
