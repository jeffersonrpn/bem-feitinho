import type {
  CalculatorConfig,
} from "../types";

export const crochetCalculator: CalculatorConfig = {
  id: "crochet",
  name: "Crochê",
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
      id: "design",
      label: "Tipo de projeto",
      type: "select",
      required: false,
      options: [
        {
          id: "original",
          multiplier: 1.5,
          label: "Projeto original",
        },
        {
          id: "adaptation",
          multiplier: 1.25,
          label: "Projeto adaptado",
        },
        {
          id: "replica",
          multiplier: 1,
          label: "Projeto réplica",
        },
      ],
    },

    {
      id: "style",
      label: "Estilo do fio",
      type: "select",
      required: false,
      options: [
        {
          id: "basic",
          multiplier: 1,
          label: "Básico",
        },
        {
          id: "fantasy",
          multiplier: 1.15,
          label: "Fantasia",
        },
        {
          id: "conducted",
          multiplier: 1.25,
          label: "Fio Conduzido",
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
      id: "totalTime",
      label: "Tempo total em horas",
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
