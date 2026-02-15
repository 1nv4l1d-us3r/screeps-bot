import { WorkerRoles } from "./base";
import { harvesterRole,HarvesterMemory } from "./harvester";
import { upgraderRole,UpgraderMemory } from "./upgrader";
import { builderRole,BuilderMemory } from "./builder";
import { minerRole,MinerMemory } from "./miner";


export interface WorkerCreepMemory extends HarvesterMemory,UpgraderMemory,BuilderMemory,MinerMemory {
    role:WorkerRoles
}




export const getWorkerHandler = (creep: Creep) => {
    switch(creep.memory.role) {
        case WorkerRoles.HARVESTER:
            return harvesterRole
        case WorkerRoles.UPGRADER:
            return upgraderRole;
        case WorkerRoles.BUILDER:
            return builderRole;
        case WorkerRoles.MINER:
            return minerRole;
    }
}