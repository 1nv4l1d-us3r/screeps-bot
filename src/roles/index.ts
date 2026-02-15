import { CreepRoles } from "./base";
import { harvesterRole,HarvesterCreep } from "./harvester";
import { upgraderRole,UpgraderCreep } from "./upgrader";
import { builderRole,BuilderCreep } from "./builder";



export type WorkerCreep = 
    | HarvesterCreep
    | UpgraderCreep
    | BuilderCreep;
    

export const getWorkerHandler = (creep: WorkerCreep) => {
    switch(creep.memory.role) {
        case CreepRoles.HARVESTER:
            return harvesterRole
        case CreepRoles.UPGRADER:
            return upgraderRole;
        case CreepRoles.BUILDER:
            return builderRole;
    }
}