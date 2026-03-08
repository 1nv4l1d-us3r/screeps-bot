import { Worker } from "types/worker";
import { WorkerRoles } from "types/roles";
import { TasksType, PickupResourceTask } from "types/tasks";


type PickupResourceTaskWorker = Worker<WorkerRoles,TasksType.PICKUP_RESOURCE>;
type TransferResourceTaskWorker = Worker<WorkerRoles,TasksType.TRANSFER_RESOURCE>;

export class LogisticsTaskHandler {

    public static handlePickupResourceTask(worker: PickupResourceTaskWorker) {
        const memory = worker.memory;
        const task = memory.task;
        const taskData = task.data;
        const droppedResourceId = taskData.droppedResourceId;
        const droppedResource = Game.getObjectById(droppedResourceId);
        if(!droppedResource) {
            memory.task = undefined;
            return;
        }
        const pickupResult = worker.pickup(droppedResource);
        if(pickupResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(droppedResource);
        }
        else if(pickupResult === ERR_INVALID_TARGET) {
            memory.task = undefined;
        }
        if(worker.store.getFreeCapacity() === 0) {
            memory.task = undefined;
        }
    }

    public static handleTransferResourceTask(worker: TransferResourceTaskWorker) {
        const memory = worker.memory;
        const task = memory.task;
        const taskData = task.data;
        const targetStructureId = taskData.targetStructureId;
        const targetStructure = Game.getObjectById(targetStructureId);
        if(!targetStructure) {
            memory.task = undefined;
        }
        const transferResult = worker.transfer(targetStructure, taskData.resourceType);
        if(transferResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(targetStructure);
        }
        else if(transferResult === ERR_NOT_ENOUGH_RESOURCES) {
            memory.task = undefined;
        }
        else if(transferResult === ERR_INVALID_TARGET) {
            memory.task = undefined;
        }
        if(worker.store.getUsedCapacity() === 0) {
            memory.task = undefined;
        }
    }
}