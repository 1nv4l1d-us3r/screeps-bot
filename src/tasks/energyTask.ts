import { Worker } from "types/worker";
import { WorkerRoles } from "types/roles";
import { TasksType, WithdrawEnergyTask } from "types/tasks";

import { LogisticsManager } from "room/managers/logisticsmanager";

type WithdrawEnergyTaskWorker = Worker<WorkerRoles,TasksType.WITHDRAW_ENERGY>;


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
            const energyProviderStructure = LogisticsManager.getResourceWithdrawStructures(worker.room,RESOURCE_ENERGY);
            if(energyProviderStructure.length === 0) {
                memory.task = undefined;
                worker.say('💤')
                return;
            }
            energyProviderStructure.sort((a,b)=>a.pos.getRangeTo(worker.pos)-b.pos.getRangeTo(worker.pos))
            const closestEnergyProvider=energyProviderStructure.shift()
            taskData.withdrawStructureId = closestEnergyProvider.id;
        }
        
        const withdrawStructure = Game.getObjectById(taskData.withdrawStructureId);
        if(!withdrawStructure) {
            taskData.withdrawStructureId = undefined;
            worker.say('⚠️?')
            return;
        }
        const withdrawResult = worker.withdraw(withdrawStructure, RESOURCE_ENERGY);
        if(withdrawResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(withdrawStructure);
        }
        else if(withdrawResult === ERR_INVALID_TARGET) {
            worker.say('⚠️?')
            taskData.withdrawStructureId = undefined;
            return;
        }
        if(worker.store.getFreeCapacity() === 0) {
            memory.task = undefined;
            return;
        }
    }

}



