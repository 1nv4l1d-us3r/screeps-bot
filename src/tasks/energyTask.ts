import { TasksType, WithdrawEnergyTask } from "types/tasks";
import { TaskWorker } from "types/tasks";

type WithdrawEnergyTaskWorker = TaskWorker<TasksType.WITHDRAW_ENERGY>;


type EnergyProviderStructure = StructureContainer | StructureStorage;

export class EnergyTaskHandler {


    private static findEnergyProviderStructure(room: Room) {


        const roomStructures = room.find(FIND_STRUCTURES);
        let energyProviderStructure: EnergyProviderStructure | undefined = undefined;
        for(const structure of roomStructures) {
            if(structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE) {
                if(structure.store.energy > 50) {
                    energyProviderStructure = structure;
                }
            }
        }
        return energyProviderStructure;
    }



    public static handleWithdrawEnergyTask(worker: WithdrawEnergyTaskWorker) {

        const memory = worker.memory;
        const task = memory.task;
        const taskData = task.data;

        if(!taskData?.withdrawStructureId) {
            const energyProviderStructure = this.findEnergyProviderStructure(worker.room);
            if(!energyProviderStructure) {
                memory.task = undefined;
                return;
            }
            taskData.withdrawStructureId = energyProviderStructure.id;
            return;
        }
        
        const withdrawStructure = Game.getObjectById(taskData.withdrawStructureId);
        if(!withdrawStructure) {
            taskData.withdrawStructureId = undefined;
            return;
        }
        const withdrawResult = worker.withdraw(withdrawStructure, RESOURCE_ENERGY);
        if(withdrawResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(withdrawStructure);
        }
        else if(withdrawResult === ERR_INVALID_TARGET) {
            taskData.withdrawStructureId = undefined;
            return;
        }
        if(worker.store.getFreeCapacity() === 0) {
            memory.task = undefined;
            return;
        }
    }

}



