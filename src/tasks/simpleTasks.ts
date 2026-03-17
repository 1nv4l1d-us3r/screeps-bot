import { Worker,WorkerMemory} from "types/worker";

import { WorkerRoles } from "types/roles";
import { TasksType} from "../types/tasks";

type MiningTaskWorker = Worker<WorkerRoles,TasksType.MINE_RESOURCE>
type RepairTaskWorker = Worker<WorkerRoles,TasksType.REPAIR>

export class SimpleTaskHandler {

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

    public static handleRepairTask(worker: RepairTaskWorker) {
        const memory = worker.memory;
        const task = memory.task;
        const taskData = task.data
        const repairStructureId = taskData.repairStructureId;
        const repairStructure = Game.getObjectById(repairStructureId);
        if(!repairStructure) {
            memory.task = undefined;
            return 
        }
        if(taskData.repairHits && repairStructure.hits >= taskData.repairHits) {
            memory.task = undefined;
            return;
        }
        const repairResult = worker.repair(repairStructure);
        if(repairResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(repairStructure);
        }
        else if(repairResult === ERR_NOT_ENOUGH_ENERGY) {
            memory.task = undefined;
        }
        else if(
            repairResult === ERR_INVALID_TARGET
        ) {
            memory.task = undefined;
        }

    }
}

