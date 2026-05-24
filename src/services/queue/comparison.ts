import {
  calculateCostFromResult,
  type QueueCostParams,
} from './cost';

export function attachCostsToResults<
  T extends {
    LRounded: number;
    servers: number;
  }
>(
  results: T[],
  costs: QueueCostParams
) {
  return results.map((result) => ({
    ...result,
    cost: calculateCostFromResult(result, costs),
  }));
}

export function findCheapestModel<
  T extends {
    cost: {
      totalCost: number;
    };
  }
>(results: T[]) {
  return results.reduce((best, current) =>
    current.cost.totalCost <
    best.cost.totalCost
      ? current
      : best
  );
}