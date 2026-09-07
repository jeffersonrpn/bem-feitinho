import type { Fee } from "../types";

export type CrochetProject =
  | "original"
  | "adaptation"
  | "replica";

export type CrochetStyle =
  | "basic"
  | "fantasy"
  | "conducted";

export type CrochetInput = {
  sizeCm?: number;
  complexity: number;
  design?: CrochetProject;
  style?: CrochetStyle;
  materials?: number;
  totalTime?: number;
  indirectCosts?: number;
  fees?: Fee[];
  profitMargin?: number;
};
