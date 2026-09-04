export type TattooDesign =
  | "ready"
  | "adaptation"
  | "original";

export type TattooStyle =
  | "black"
  | "black-shading"
  | "color"
  | "black-color";

export type TattooInput = {
  sizeCm?: number;
  complexity: number;
  bodyPart?: string;
  design?: TattooDesign;
  style?: TattooStyle;
  materials?: number;
  sessions?: number;
  hoursPerSession?: number;
  indirectCosts?: number;
  fees?: TattooFee[];
  profitMargin?: number;
};

export type TattooFee =
  | {
    type: "fixed";
    value: number;
  }
  | {
    type: "percentage";
    value: number;
  };
