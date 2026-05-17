import type { QueueInput, QueueResult } from "../../models/queue.types";
import { calculateMM1 } from "./mm1";
import { calculateMMS } from "./mms";
import { calculateMG1 } from "./mg1";
import { calculateMD1 } from "./md1";

export function calculateQueue(data: QueueInput): QueueResult {
    switch (data.model) {
        case "MM1":
            return calculateMM1(data);

        case "MMS":
            return calculateMMS(data);

        case "MG1":
            return calculateMG1(data);

        case "MD1":
            return calculateMD1(data);

        default:
            throw new Error("Modelo de cola no soportado");
    }
}
