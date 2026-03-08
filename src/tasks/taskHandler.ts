import {Worker, WorkerMemory } from "types/worker";
import { Task,TasksType } from "types/tasks";
import { EnergyTaskHandler } from "./energyTask";
import { MiningTaskHandler } from "./miningTask";
import { PickupTasksHandler } from "./pickupTasks";

type TaskHandlerFunction<T extends Task['taskType']> = (worker: TaskWorker<T>) => void;

type TaskWorker<T extends TasksType> = Worker & {memory:WorkerMemory & {task:Task & {taskType:T}}}

export class TaskHandler {

    private static taskHanderMap: Record<TasksType, TaskHandlerFunction<TasksType>> = {
        [TasksType.WITHDRAW_ENERGY]: EnergyTaskHandler.handleWithdrawEnergyTask,
        [TasksType.MINE_RESOURCE]: MiningTaskHandler.handleMiningTask,
        [TasksType.PICKUP_RESOURCE]: PickupTasksHandler.handlePickupResourceTask,
    };



    public static handleTask(worker: TaskWorker<any>) {
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