import type { QueueInput, QueueResult } from "../../models/queue.types";
import { calculateMM1 } from "./mm1";
import { calculateMMS } from "./mms";
import { calculateMG1 } from "./mg1";
import { calculateMD1 } from "./md1";
import { calculateCostFromResult } from "./cost";

export function calculateQueue(data: QueueInput): QueueResult {
  let result: QueueResult;

  switch (data.model) {
    case "MM1":
      result = calculateMM1(data);
      break;

    case "MMS":
      result = calculateMMS(data);
      break;

    case "MG1":
      result = calculateMG1(data);
      break;

    case "MD1":
      result = calculateMD1(data);
      break;

    default:
      throw new Error("Modelo de cola no soportado");
  }

  const hasCostData =
    Number.isFinite(data.serviceCostPerHour) &&
    Number.isFinite(data.waitingCostPerHour);

  if (!hasCostData) {
    return result;
  }

  const cost = calculateCostFromResult(result, {
    serviceCostPerHour: data.serviceCostPerHour,
    waitingCostPerHour: data.waitingCostPerHour,
  });

  return {
    ...result,
    cost,
  };
}