const ROUTE_SEGMENTS: Record<string, string> = {
  tattoo: "tatuagem",
  crochet: "croche",
};

export function getCalculatorRouteSegment(calculatorId: string) {
  return ROUTE_SEGMENTS[calculatorId] ?? calculatorId;
}

export function getCalculatorIdFromRouteSegment(
  routeSegment: string,
  calculatorIds: string[],
) {
  return calculatorIds.find(
    (calculatorId) =>
      calculatorId === routeSegment ||
      getCalculatorRouteSegment(calculatorId) === routeSegment,
  );
}
