import { CreepRoles } from "./base";
import {baseHarvesterMemory,harvesterRole} from "./harvester";


export interface baseUpgraderMemory extends baseHarvesterMemory{
    roomControllerId?: Id<StructureController>;
}

interface upgraderMemory extends baseUpgraderMemory{
    role: CreepRoles.UPGRADER;
}

export type UpgraderCreep = Creep & {
    memory: upgraderMemory;
}

type  BaseUpgraderCreep = Creep & {
    memory: baseUpgraderMemory;
}


export const upgraderRole = (creep: BaseUpgraderCreep) => {

    if(creep.store.getUsedCapacity() === 0) {
        creep.memory.isHarvesting = true;
    }

    if(creep.memory.isHarvesting) {
        harvesterRole(creep);
        return;
    }

    if(!creep.memory.roomControllerId) {
        const controller = creep.room.controller;
        if(controller) {
            creep.memory.roomControllerId = controller.id;
        }
        return;
    }

    if(creep.memory.roomControllerId) {
        const controller = Game.getObjectById(creep.memory.roomControllerId);
        if(controller) {
            const upgradeResult = creep.upgradeController(controller);
            console.log(`upgrade result: ${upgradeResult}`);
            if(upgradeResult === ERR_NOT_IN_RANGE) {
                creep.say('not in range moving to controller');
                creep.moveTo(controller);
            }
            else if(upgradeResult === ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.isHarvesting = true;
            }
        }
    }


    
}