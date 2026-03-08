
import {  Worker } from "../types/worker";
import { TasksType } from "types/tasks";
import { getAdjacentCoords } from "../geometry";

import { MinerMemory, WorkerRoles } from "../types/roles";
import { Task,ResourceMiningTask } from "types/tasks";

type  MinerWorker = Worker<WorkerRoles.MINER>;




export const minerRole = (worker: MinerWorker) => {
    const memory = worker.memory;
    const roleMemory=memory.roleMemory

    const miningCoord = roleMemory.miningCoord;

    if(worker.pos.x !== miningCoord.x || worker.pos.y !== miningCoord.y) {
        worker.moveTo(miningCoord.x,miningCoord.y);
        return;
    }

    if(roleMemory.storageType== STRUCTURE_LINK && !roleMemory.storageStructureId) {
        const storageCoord = roleMemory.storageCoord;
        const link = worker.room.lookForAt(LOOK_STRUCTURES, storageCoord.x, storageCoord.y)
        const structureLink:StructureLink|undefined = link.find((st: Structure<StructureConstant>) => st.structureType === STRUCTURE_LINK) as StructureLink|undefined;
        if(structureLink) {
            roleMemory.storageStructureId = structureLink.id;
        }
        else {
            // if storage structure is not found, dont use structure
            roleMemory.storageType = undefined;
        }
    }



    if(roleMemory.storageStructureId){
        const storageStructure = Game.getObjectById(roleMemory.storageStructureId);
        if(!storageStructure) {
            roleMemory.storageStructureId = undefined;
            return;
        }
        const transferResult = worker.transfer(storageStructure, roleMemory.resourceType);
    }

    
    if (worker.store.getUsedCapacity() === 0) {
        const miningTask: ResourceMiningTask = {
            taskType: TasksType.MINE_RESOURCE,
            data: {
                resourceId: roleMemory.resourceId,
            }
        }
        memory.task = miningTask;
    }

   
}
