
import { builderRole } from "./builder";
import { Worker } from "types/worker";
import { RefillingStructure } from "types/roles";
import { TasksType, WithdrawResourceTask } from "types/tasks";
import { WorkerRoles } from "types/roles";


// other creeps can inherit from this memory
type HarvesterWorker = Worker<WorkerRoles.HARVESTER>;


export const harvesterRole = (worker:HarvesterWorker) => {
    const memory = worker.memory;
    const roleMemory=memory.roleMemory


    if (!roleMemory.energyFillingStructureId) {
        const energyFillingStructure: RefillingStructure|null = worker.pos.findClosestByRange(
            FIND_MY_STRUCTURES,
            {
                filter: (st) =>
                    (  
                         st.structureType === STRUCTURE_EXTENSION
                        || st.structureType === STRUCTURE_TOWER
                        // || st.structureType === STRUCTURE_SPAWN
                    )
                    && st.store.energy < st.store.getCapacity('energy')
            }
        );
        if(energyFillingStructure) {
            roleMemory.energyFillingStructureId = energyFillingStructure.id;
        }
        else {
            builderRole(worker as any);
            return;
        }
    }

    if(roleMemory.energyFillingStructureId) {
        const energyFillingStructure = Game.getObjectById(roleMemory.energyFillingStructureId);
        if(!energyFillingStructure) {
            roleMemory.energyFillingStructureId = undefined;
            return;
        }
        if(energyFillingStructure.store.energy === energyFillingStructure.store.getCapacity('energy')) {
            roleMemory.energyFillingStructureId = undefined;
            return;
        }

        const fillResult = worker.transfer(energyFillingStructure, RESOURCE_ENERGY);
        
        if(fillResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(energyFillingStructure);
        }
        else if(fillResult === ERR_NOT_ENOUGH_RESOURCES) {
            const withdrawEnergyTask: WithdrawResourceTask = {
                taskType: TasksType.WITHDRAW_RESOURCE,
                data: {
                    withdrawStructureId: 'auto',
                    resourceType: RESOURCE_ENERGY,
                }
            }
            memory.task = withdrawEnergyTask;
        }
        else if(fillResult === ERR_FULL || fillResult ==ERR_INVALID_TARGET) {
            roleMemory.energyFillingStructureId = undefined;
        }
    }



}

