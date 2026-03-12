import { Worker } from "types/worker";
import { WorkerRoles } from "types/roles";
import { TasksType, PickupResourceTask } from "types/tasks";
import { LogisticsManager } from "room/managers/logisticsManager";

type WithdrawResourceTaskWorker = Worker<WorkerRoles,TasksType.WITHDRAW_RESOURCE>;
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
        console.log(`pickupResult: ${pickupResult}`);
        if(pickupResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(droppedResource);
            return;
        }
        else if(
            pickupResult === ERR_FULL
            || pickupResult === ERR_INVALID_TARGET
        ) {
            memory.task = undefined;
        }
        if(worker.store.getUsedCapacity() === worker.store.getCapacity()) {
            memory.task = undefined;
        }
    }

    public static handleWithdrawResourceTask(worker: WithdrawResourceTaskWorker) {
        const memory = worker.memory;
        const task = memory.task;
        const taskData = task.data;
        let withdrawStructureId=taskData.withdrawStructureId;

        if(withdrawStructureId === 'auto') {
            const withdrawStructure = LogisticsManager.getResourceWithdrawStructures(worker.room,taskData.resourceType);
            if(withdrawStructure.length === 0) {
                memory.task = undefined;
                return;
            }
            withdrawStructure.sort((a,b)=>a.pos.getRangeTo(worker.pos)-b.pos.getRangeTo(worker.pos))
            const closestWithdrawStructure = withdrawStructure.shift();
            withdrawStructureId = closestWithdrawStructure.id;
            taskData.withdrawStructureId = withdrawStructureId;
        }
        if(withdrawStructureId) {
            const withdrawStructure = Game.getObjectById(withdrawStructureId);
            if(!withdrawStructure) {
                memory.task = undefined;
                return;
            }
            const withdrawResult = worker.withdraw(withdrawStructure, taskData.resourceType);
            if(withdrawResult === ERR_NOT_IN_RANGE) {
                worker.moveTo(withdrawStructure);
            }
            else if(
                withdrawResult === ERR_INVALID_TARGET 
                || withdrawResult === ERR_NOT_ENOUGH_RESOURCES
                || withdrawResult === ERR_FULL
            ) {
                memory.task = undefined;
                return;
            }
            if(worker.store.getUsedCapacity()===worker.store.getCapacity()) {
                memory.task = undefined;
            } 
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
        else if (
            transferResult === ERR_NOT_ENOUGH_RESOURCES
            || transferResult === ERR_INVALID_TARGET
        ) {
            memory.task = undefined;
        }
        
        if(worker.store.getUsedCapacity() === 0) {
            memory.task = undefined;
        }
    }
}