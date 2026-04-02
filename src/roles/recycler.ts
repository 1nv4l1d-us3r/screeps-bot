

import { Worker } from "types/worker";

import { WorkerRoles } from "types/roles";
import { Task, TasksType } from "types/tasks";


type RecyclerWorker = Worker<WorkerRoles.RECYCLER, TasksType>;


export class Recycler {

    public static handleRecyclerRole(worker: RecyclerWorker) {
        const memory = worker.memory;
        const roleMemory = memory.roleMemory;
        
        if(!roleMemory.ruinId) {
            const ruins = worker.room.find(FIND_RUINS);

            const filteredRuins = ruins.filter(
                ruin => {
                    if (!ruin.store) {
                        return false;
                    }
                    const hasEnergy = ruin.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                    const isLasting = ruin.ticksToDecay > 100;

                    return hasEnergy && isLasting;
                }
            );

            if(filteredRuins.length > 0) {
                const closestRuin = filteredRuins.sort((a,b)=>a.pos.getRangeTo(worker.pos)-b.pos.getRangeTo(worker.pos)).shift();
                roleMemory.ruinId = closestRuin.id;
            }
            else {
                worker.say('🗑️❌')
                return;
            }
        }
        else {
            const ruin = Game.getObjectById(roleMemory.ruinId);
            if(!ruin) {
                roleMemory.ruinId = undefined;
                return;
            }


            const widthrawResult = worker.withdraw(ruin, RESOURCE_ENERGY);
            if(widthrawResult === ERR_NOT_IN_RANGE) {
                worker.moveTo(ruin);
                return;
            }
            else if(widthrawResult === ERR_NOT_ENOUGH_RESOURCES || widthrawResult === ERR_INVALID_TARGET) {
                roleMemory.ruinId = undefined;
                return;
            }

            if(worker.store.getUsedCapacity() === worker.store.getCapacity()) {

                const transferEnergyTask: Task<TasksType.TRANSFER_RESOURCE> = {
                    taskType: TasksType.TRANSFER_RESOURCE,
                    data: {
                        targetStructureId: 'auto',
                        resourceType: RESOURCE_ENERGY,
                    }
                }
                worker.memory.task = transferEnergyTask;
                return;
            }

            
        }
    }
}