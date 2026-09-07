import { Fee } from "../types";

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
  fees?: Fee[];
  profitMargin?: number;
};
