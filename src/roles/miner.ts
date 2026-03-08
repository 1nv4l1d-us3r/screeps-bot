
import { TasksType } from "types/tasks";
import { getAdjacentCoords } from "../geometry";

import {  BaseWorker } from "../types/worker";
import { MinerMemory } from "../types/roles";
import { Task,ResourceMiningTask } from "types/tasks";

type  BaseMiner = BaseWorker<MinerMemory>;




export const minerRole = (worker: BaseMiner) => {
    const memory = worker.memory;

    const miningCoord = memory.miningCoord;

    if(worker.pos.x !== miningCoord.x || worker.pos.y !== miningCoord.y) {
        worker.moveTo(miningCoord.x,miningCoord.y);
        return;
    }

    if(memory.storageType== STRUCTURE_LINK && !memory.storageStructureId) {
        const storageCoord = memory.storageCoord;
        const link = worker.room.lookForAt(LOOK_STRUCTURES, storageCoord.x, storageCoord.y)
        const structureLink:StructureLink|undefined = link.find((st: Structure<StructureConstant>) => st.structureType === STRUCTURE_LINK) as StructureLink|undefined;
        if(structureLink) {
            memory.storageStructureId = structureLink.id;
        }
        else {
            // if storage structure is not found, dont use structure
            memory.storageType = undefined;
        }
    }



    if(memory.storageStructureId){
        const storageStructure = Game.getObjectById(memory.storageStructureId);
        if(!storageStructure) {
            memory.storageStructureId = undefined;
            return;
        }
        const transferResult = worker.transfer(storageStructure, memory.resourceType);
    }

    
    if (worker.store.getUsedCapacity() === 0) {
        const miningTask: ResourceMiningTask = {
            taskType: TasksType.MINE_RESOURCE,
            data: {
                resourceId: memory.resourceId,
            }
        }
        memory.task = miningTask;
    }

   
}
