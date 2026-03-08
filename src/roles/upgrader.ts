import { TasksType, WithdrawEnergyTask } from "types/tasks";
import { BaseWorker } from "types/worker";
import { Worker } from "types/worker";




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
        const withdrawEnergyTask: WithdrawEnergyTask = {
            taskType: TasksType.WITHDRAW_ENERGY,
            data: {
            }
        }
        memory.task = withdrawEnergyTask;
    }
    
}