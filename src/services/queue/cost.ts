export interface QueueBaseResult {
  LRounded: number;
  servers: number;
}

export interface QueueCostParams {
  serviceCostPerHour: number;
  waitingCostPerHour: number;
}

export interface QueueCostResult {
  waitingCost: number;
  serviceCost: number;
  totalCost: number;
}

export function calculateCostFromResult(
  result: QueueBaseResult,
  costs: QueueCostParams
): QueueCostResult {
  const waitingCost = costs.waitingCostPerHour * result.LRounded;
  const serviceCost = costs.serviceCostPerHour * result.servers;

  return {
    waitingCost,
    serviceCost,
    totalCost: waitingCost + serviceCost,
  };
}