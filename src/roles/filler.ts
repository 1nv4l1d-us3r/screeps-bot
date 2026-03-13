import { WorkerRoles } from "types/roles";
import { Worker } from "types/worker";
import { LogisticsManager } from "room/managers/logisticsManager";
import { Task, TasksType } from "types/tasks";


type FillerWorker = Worker<WorkerRoles.FILLER>;



export class Filler {


    public static handleFillerRole(worker: FillerWorker) {

        if(worker.store.getUsedCapacity()){

            const energyConsumers = LogisticsManager.getEnergyConsumers(worker.room);
            if(energyConsumers.length === 0) {
                worker.say('yawn!')
                return;
            }
            energyConsumers.sort((a,b)=>a.pos.getRangeTo(worker.pos)-b.pos.getRangeTo(worker.pos))
            const closestEnergyConsumer = energyConsumers.shift();

            const fillerTask: Task<TasksType.TRANSFER_RESOURCE> = {
                taskType: TasksType.TRANSFER_RESOURCE,
                data: {
                    targetStructureId: closestEnergyConsumer.id,
                    resourceType: RESOURCE_ENERGY,
                }
            }
            worker.memory.task = fillerTask;
        }
        else {

            const withdrawEnergyTask: Task<TasksType.WITHDRAW_RESOURCE> = {
                taskType: TasksType.WITHDRAW_RESOURCE,
                data: {
                    withdrawStructureId: 'auto',
                    resourceType: RESOURCE_ENERGY,
                }
            }
            worker.memory.task = withdrawEnergyTask;
        }


        
    }
}