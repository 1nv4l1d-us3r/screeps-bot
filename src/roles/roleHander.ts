
import { harvesterRole } from "./harvester";
import { upgraderRole, } from "./upgrader";
import { builderRole} from "./builder";
import { minerRole } from "./miner";
import { WorkerRoles } from "types/roles";
import { WorkersConfig, Worker } from "../types/worker";

import { MineHauler } from "./hauler";






export class RoleHandler {
    private static roleHandlerMap: Record<WorkerRoles, (worker: Worker) => void> = {
        [WorkerRoles.MINER]: minerRole,
        [WorkerRoles.HARVESTER]: harvesterRole,
        [WorkerRoles.UPGRADER]: upgraderRole,
        [WorkerRoles.BUILDER]: builderRole,
        [WorkerRoles.HAULER]: (worker: Worker<WorkerRoles.HAULER>) => MineHauler.handleMineHaulerRole(worker),
    };

    public static handleRole(worker: Worker) {
        const memory = worker.memory;
        const roleMemory = memory.roleMemory;
        const role = roleMemory?.role;
        if(!roleMemory || !role) {
            worker.say('🛠️❌')
            return;
        }
        try {
            const roleHandler = this.roleHandlerMap[role];
            if(!roleHandler) {
                return;
            }
                roleHandler(worker);
        }
        catch(error) {
            console.log(`Error handling role ${memory?.roleMemory?.role} for worker ${worker.name}: \n${error}`);
        }
    }
}


