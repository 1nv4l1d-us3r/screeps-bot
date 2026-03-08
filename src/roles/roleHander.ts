
import { harvesterRole } from "./harvester";
import { upgraderRole, } from "./upgrader";
import { builderRole} from "./builder";
import { minerRole } from "./miner";

import { WorkerRoles } from "types/roles";
import { WorkersConfig, Worker } from "../types/worker";







export class RoleHandler {
    private static roleHandlerMap: Record<WorkerRoles, (worker: Worker) => void> = {
        [WorkerRoles.MINER]: minerRole,
        [WorkerRoles.HARVESTER]: harvesterRole,
        [WorkerRoles.UPGRADER]: upgraderRole,
        [WorkerRoles.BUILDER]: builderRole,
    };

    public static handleRole(worker: Worker) {
        const role = worker.memory.role;
        const roleHandler = this.roleHandlerMap[role];
        if(!roleHandler) {
            return;
        }
        roleHandler(worker);
    }
}


