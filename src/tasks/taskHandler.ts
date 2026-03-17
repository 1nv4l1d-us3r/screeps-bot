import {Worker, WorkerMemory } from "types/worker";
import { Task,TasksType } from "types/tasks";
import { WorkerRoles } from "types/roles";

import { LogisticsTaskHandler } from "./logisticsTask";
import { SimpleTaskHandler } from "./simpleTasks";

import { TaskHandlerFunction } from "types/tasks";


export class TaskHandler {

    private static taskHanderMap: Record<TasksType, TaskHandlerFunction<TasksType>> = {
        [TasksType.WITHDRAW_RESOURCE]: LogisticsTaskHandler.handleWithdrawResourceTask,
        [TasksType.PICKUP_RESOURCE]: LogisticsTaskHandler.handlePickupResourceTask,
        [TasksType.TRANSFER_RESOURCE]: LogisticsTaskHandler.handleTransferResourceTask,
        [TasksType.MINE_RESOURCE]: SimpleTaskHandler.handleMiningTask,
        [TasksType.REPAIR]: SimpleTaskHandler.handleRepairTask,
    };



    public static handleTask(worker: Worker<any,any>) {
        const memory = worker.memory;
        const task = memory.task;
        const taskType = task.taskType;
        const taskHandler = this.taskHanderMap[taskType];
        if(!taskHandler) {
            memory.task = undefined;
            return;
        }
        taskHandler(worker);
    }
}