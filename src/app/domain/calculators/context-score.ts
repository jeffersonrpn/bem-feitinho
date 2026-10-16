import type {
  ContextScore,
  ContextScoringConfig,
  HistoricalCalculation,
  PricingResult,
} from "./types";

type Comparable = {
  distance: number;
  price: number;
};

function isPresent(value: unknown) {
  return value !== undefined && value !== null && value !== "";
}

function getNumericValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function getComparableDistance(
  currentInput: Record<string, unknown>,
  historicalInput: Record<string, unknown>,
  config: ContextScoringConfig,
): number | undefined {
  const activeFields = config.fields.filter((field) =>
    isPresent(currentInput[field.id]),
  );
  const totalWeight = activeFields.reduce(
    (sum, field) => sum + field.weight,
    0,
  );

  if (totalWeight <= 0) {
    return undefined;
  }

  let coveredWeight = 0;
  let weightedSquaredDistance = 0;

  for (const field of activeFields) {
    const currentValue = currentInput[field.id];
    const historicalValue = historicalInput[field.id];

    if (!isPresent(historicalValue)) {
      continue;
    }

    let distance: number;

    if (field.type === "number") {
      const currentNumber = getNumericValue(currentValue);
      const historicalNumber = getNumericValue(historicalValue);

      if (currentNumber === undefined || historicalNumber === undefined) {
        continue;
      }

      const scale = Math.max(
        Math.abs(currentNumber),
        Math.abs(historicalNumber),
        field.minimumScale ?? 1,
      );
      distance = Math.min(
        Math.abs(currentNumber - historicalNumber) / scale,
        1,
      );
    } else {
      if (
        typeof currentValue !== "string" ||
        typeof historicalValue !== "string"
      ) {
        continue;
      }

      distance = currentValue === historicalValue ? 0 : 1;
    }

    coveredWeight += field.weight;
    weightedSquaredDistance += field.weight * distance ** 2;
  }

  if (coveredWeight / totalWeight < config.minimumCoverage) {
    return undefined;
  }

  return Math.sqrt(weightedSquaredDistance / coveredWeight);
}

function unavailableScore(
  reason: Extract<ContextScore, { status: "unavailable" }>["reason"],
  basePrice: number,
  peerCount = 0,
): ContextScore {
  return {
    status: "unavailable",
    reason,
    peerCount,
    basePrice,
  };
}

export function applyContextScore(
  result: PricingResult,
  input: object,
  history: HistoricalCalculation[],
  config: ContextScoringConfig,
): PricingResult {
  const currentInput = input as Record<string, unknown>;
  const basePrice = result.suggestedTotal;
  const activeFields = config.fields.some((field) =>
    isPresent(currentInput[field.id]),
  );

  if (!activeFields) {
    return {
      ...result,
      contextScore: unavailableScore(
        "no-comparable-attributes",
        basePrice,
      ),
    };
  }

  const peers: Comparable[] = history
    .filter((sample) =>
      sample.currency === config.currency &&
      sample.calculatorVersion === config.calculatorVersion &&
      Number.isFinite(sample.suggestedTotal) &&
      sample.suggestedTotal >= 0,
    )
    .map((sample) => ({
      distance: getComparableDistance(
        currentInput,
        sample.inputSnapshot,
        config,
      ),
      price: sample.suggestedTotal,
    }))
    .filter((peer): peer is Comparable =>
      peer.distance !== undefined &&
      peer.distance <= config.maximumDistance,
    )
    .sort((left, right) => left.distance - right.distance)
    .slice(0, config.maximumPeers);

  if (peers.length === 0) {
    return {
      ...result,
      contextScore: unavailableScore("no-neighbors", basePrice),
    };
  }

  if (peers.length < config.minimumPeers) {
    return {
      ...result,
      contextScore: unavailableScore(
        "insufficient-peers",
        basePrice,
        peers.length,
      ),
    };
  }

  const mean = peers.reduce((sum, peer) => sum + peer.price, 0) /
    peers.length;
  const variance = peers.reduce(
    (sum, peer) => sum + (peer.price - mean) ** 2,
    0,
  ) / (peers.length - 1);
  const standardDeviation = Math.sqrt(variance);

  if (!Number.isFinite(standardDeviation) || standardDeviation === 0) {
    return {
      ...result,
      contextScore: unavailableScore(
        "zero-variance",
        basePrice,
        peers.length,
      ),
    };
  }

  const suggestedPrice = Math.max(
    result.subtotal,
    Math.round(
      basePrice + config.calibrationFactor * (mean - basePrice),
    ),
  );
  const contextScore: ContextScore = {
    status: "available",
    score: (basePrice - mean) / standardDeviation,
    meanPrice: Math.round(mean),
    standardDeviation,
    peerCount: peers.length,
    basePrice,
    suggestedPrice,
  };

  return {
    ...result,
    total: suggestedPrice,
    suggestedTotal: suggestedPrice,
    breakdown: {
      ...result.breakdown,
      profit: Math.max(0, suggestedPrice - result.subtotal),
    },
    contextScore,
  };
}
