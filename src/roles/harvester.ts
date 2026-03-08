
import { builderRole } from "./builder";
import { BaseWorker } from "types/worker";
import { RefillingStructure,HarvesterMemory } from "types/roles";
import { TasksType, WithdrawEnergyTask } from "types/tasks";

// other creeps can inherit from this memory
type BaseHarvester = BaseWorker<HarvesterMemory>;



export const harvesterRole = (worker:BaseHarvester) => {
    const memory = worker.memory;


    if (!memory.energyFillingStructureId) {
        const energyFillingStructure: RefillingStructure|null = worker.pos.findClosestByRange(
            FIND_MY_STRUCTURES,
            {
                filter: (st) =>
                    (   st.structureType === STRUCTURE_SPAWN
                        || st.structureType === STRUCTURE_EXTENSION
                        || st.structureType === STRUCTURE_TOWER
                    )
                    && st.store.energy < st.store.getCapacity('energy')
            }
        );
        if(energyFillingStructure) {
            worker.memory.energyFillingStructureId = energyFillingStructure.id;
        }
        else {
            builderRole(worker);
            return;
        }
    }

    if(!memory.energyFillingStructureId) {
        const energyFillingStructure = Game.getObjectById(worker.memory.energyFillingStructureId);
        if(!energyFillingStructure) {
            worker.memory.energyFillingStructureId = undefined;
            return;
        }
        if(energyFillingStructure.store.energy === energyFillingStructure.store.getCapacity('energy')) {
            worker.memory.energyFillingStructureId = undefined;
            return;
        }

        const fillResult = worker.transfer(energyFillingStructure, RESOURCE_ENERGY);
        
        if(fillResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(energyFillingStructure);
        }
        else if(fillResult === ERR_NOT_ENOUGH_RESOURCES) {
            const withdrawEnergyTask: WithdrawEnergyTask = {
                taskType: TasksType.WITHDRAW_ENERGY,
                data: {
                }
            }
            memory.task = withdrawEnergyTask;
            return;
        }
        else if(fillResult === ERR_FULL || fillResult ==ERR_INVALID_TARGET) {
            worker.memory.energyFillingStructureId = undefined;
        }
    }



}

