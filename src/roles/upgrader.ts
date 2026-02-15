import { collectEnergy, EnergyCollectionMemory } from "../actions/energyCollection";
import { WorkerRoles } from "./base";


export interface baseUpgraderMemory extends EnergyCollectionMemory{
}

interface upgraderMemory extends baseUpgraderMemory{
    role: WorkerRoles.UPGRADER;
}

export type Upgrader = Creep & {
    memory: upgraderMemory;
}

type  BaseUpgrader = Creep & {
    memory: baseUpgraderMemory;
}


export const upgraderRole = (creep: BaseUpgrader) => {

    const roomController=creep.room.controller

    if(!roomController){
        return 
    }

    const upgradeResult = creep.upgradeController(roomController);

    if(upgradeResult==ERR_NOT_IN_RANGE){
        creep.moveTo(roomController)
    }
    if(upgradeResult==ERR_NOT_ENOUGH_RESOURCES){
        creep.memory.isCollectingEnergy=true
    }
    
}