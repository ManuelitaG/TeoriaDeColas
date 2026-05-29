import type { QueueInput, QueueResult } from "../../models/queue.types";
import { calculateMM1 } from "./mm1";
import { calculateMMS } from "./mms";
import { calculateCostFromResult } from "./cost";

export interface QueueComparisonResult extends QueueResult {
  model: string;
}

export interface QueueComparisonOutput {
  results: QueueComparisonResult[];
  mostEfficient: QueueComparisonResult | null;
  cheapest: QueueComparisonResult | null;
}

export function compareMM1AndMMS(data: QueueInput): QueueComparisonOutput {
  const results: QueueComparisonResult[] = [];

  const mm1Result = calculateMM1({
    ...data,
    model: "MM1",
    s: 1,
  });

  const mm1Cost = calculateCostFromResult(mm1Result, {
    serviceCostPerHour: data.serviceCostPerHour,
    waitingCostPerHour: data.waitingCostPerHour,
  });

  results.push({
    ...mm1Result,
    model: "M/M/1",
    cost: mm1Cost,
  });

  const maxServers = data.s ?? 1;

  for (let servers = 2; servers <= maxServers; servers++) {
    const mmsResult = calculateMMS({
      ...data,
      model: "MMS",
      s: servers,
    });

    const mmsCost = calculateCostFromResult(mmsResult, {
      serviceCostPerHour: data.serviceCostPerHour,
      waitingCostPerHour: data.waitingCostPerHour,
    });

    results.push({
      ...mmsResult,
      model: `M/M/${servers}`,
      cost: mmsCost,
    });
  }

  const viableResults = results.filter((result) => result.stable);

  const mostEfficient =
    viableResults.length === 0
      ? null
      : viableResults.reduce((best, current) =>
          current.Wq < best.Wq ? current : best
        );

  const cheapest =
    viableResults.length === 0
      ? null
      : viableResults.reduce((best, current) =>
          (current.cost?.totalCost ?? Infinity) <
          (best.cost?.totalCost ?? Infinity)
            ? current
            : best
        );

  return {
    results,
    mostEfficient,
    cheapest,
  };
}