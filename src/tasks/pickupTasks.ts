import { TaskWorker, PickupResourceTask, TasksType } from "types/tasks";


type PickupResourceTaskWorker = TaskWorker<TasksType.PICKUP_RESOURCE>;


export class PickupTasksHandler {

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
}