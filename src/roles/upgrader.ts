import { TasksType, WithdrawResourceTask } from "types/tasks";
import { Worker } from "types/worker";

import { LogisticsManager } from "room/managers/logisticsManager";





export const upgraderRole = (worker: Worker) => {
    const memory = worker.memory;

    const roomController=worker.room.controller
    if(!roomController){
        return 
    }

    const upgradeResult = worker.upgradeController(roomController);


    if(upgradeResult==ERR_NOT_IN_RANGE){
        worker.moveTo(roomController)
    }
    if(upgradeResult==ERR_NOT_ENOUGH_RESOURCES){
        const upgraderStorage=LogisticsManager.getUpgraderStorage(worker.room)
        
        const withdrawEnergyTask: WithdrawResourceTask = {
            taskType: TasksType.WITHDRAW_RESOURCE,
            data: {
                withdrawStructureId:upgraderStorage?upgraderStorage.id: 'auto',
                resourceType: RESOURCE_ENERGY,
            }
        }
        memory.task = withdrawEnergyTask;
    }
    
}