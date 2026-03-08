import { Worker,WorkerMemory} from "types/worker";
import {ResourceMiningTask} from "../types/tasks";


type MiningTaskWorker = Worker & {memory:WorkerMemory & {task:ResourceMiningTask}}

export class MiningTaskHandler {

    public static handleMiningTask(worker: MiningTaskWorker) {
        const memory = worker.memory;
        const task = memory.task;
        const taskData = task.data
       
        const resourceId = taskData.resourceId;
        const resource = Game.getObjectById(resourceId);
        if(!resource) {
            memory.task = undefined;
            return;
        }
        const mineResult = worker.harvest(resource);
        if(mineResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(resource);
        }
        else if(mineResult === ERR_INVALID_TARGET) {
            memory.task = undefined;
        }
        if(worker.store.getCapacity()>0 && worker.store.getFreeCapacity() === 0) {
            memory.task = undefined;
        }
    }

}

