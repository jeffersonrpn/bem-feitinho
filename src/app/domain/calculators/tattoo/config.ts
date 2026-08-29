import type {
  CalculatorFieldOption,
} from "../types";

import type {
  TattooDesign,
  TattooStyle,
} from "./types";

export type TattooBodyPart =
  | "arm"
  | "forearm"
  | "thigh"
  | "calf"
  | "shoulder"
  | "chest"
  | "back"
  | "ribs"
  | "hand"
  | "neck"
  | "knee";

export type TattooBodyPartOption =
  CalculatorFieldOption<TattooBodyPart> & {
    complexity: number;
  };

export const tattooBodyParts: TattooBodyPartOption[] = [
  {
    id: "arm",
    label: "Braço",
    complexity: 1,
  },
  {
    id: "forearm",
    label: "Antebraço",
    complexity: 1,
  },
  {
    id: "thigh",
    label: "Coxa",
    complexity: 1,
  },
  {
    id: "calf",
    label: "Panturrilha",
    complexity: 1,
  },
  {
    id: "shoulder",
    label: "Ombro",
    complexity: 2,
  },
  {
    id: "chest",
    label: "Peito",
    complexity: 2,
  },
  {
    id: "back",
    label: "Costas",
    complexity: 2,
  },
  {
    id: "ribs",
    label: "Costela",
    complexity: 3,
  },
  {
    id: "hand",
    label: "Mão",
    complexity: 3,
  },
  {
    id: "neck",
    label: "Pescoço",
    complexity: 3,
  },
  {
    id: "knee",
    label: "Joelho",
    complexity: 3,
  },
];

export const tattooDesigns: CalculatorFieldOption<TattooDesign>[] = [
  {
    id: "ready",
    label: "Desenho pronto",
    multiplier: 1,
  },
  {
    id: "adaptation",
    label: "Projeto de ajuste",
    multiplier: 1.15,
  },
  {
    id: "original",
    label: "Desenho original",
    multiplier: 1.35,
  },
];

export const tattooStyles: CalculatorFieldOption<TattooStyle>[] = [
  {
    id: "black",
    label: "Apenas preto",
    multiplier: 1,
  },
  {
    id: "black-shading",
    label: "Preto & sombreado",
    multiplier: 1.1,
  },
  {
    id: "color",
    label: "Colorida",
    multiplier: 1.2,
  },
  {
    id: "black-color",
    label: "Preto & colorido",
    multiplier: 1.25,
  },
];

export const tattooFields = [
  {
    id: "sizeCm",
    label: "Tamanho",
    type: "number" as const,
    min: 0,
    step: 0.5,
  },

  {
    id: "bodyPart",
    label: "Parte do corpo",
    type: "select" as const,
    options: tattooBodyParts,
  },

  {
    id: "design",
    label: "Desenho",
    type: "select" as const,
    options: tattooDesigns,
  },

  {
    id: "style",
    label: "Estilo",
    type: "select" as const,
    options: tattooStyles,
  },

  {
    id: "materials",
    label: "Material",
    type: "currency" as const,
    min: 0,
    step: 0.01,
  },

  {
    id: "sessions",
    label: "Número de sessões",
    type: "number" as const,
    min: 0,
    step: 1,
  },

  {
    id: "hoursPerSession",
    label: "Horas por sessão",
    type: "number" as const,
    min: 0,
    step: 0.5,
  },

  {
    id: "indirectCosts",
    label: "Custos indiretos",
    type: "currency" as const,
    min: 0,
    step: 0.01,
  },

  {
    id: "profitMargin",
    label: "Margem de lucro",
    type: "percentage" as const,
    min: 0,
    max: 100,
    step: 1,
  },
];

