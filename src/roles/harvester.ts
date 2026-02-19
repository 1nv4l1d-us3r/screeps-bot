
import { builderRole } from "./builder";
import { BaseWorker, HarvesterMemory, RefillingStructure } from "../types/worker";

// other creeps can inherit from this memory
type BaseHarvester = BaseWorker<HarvesterMemory>;



export const harvesterRole = (worker:BaseHarvester) => {

    if (!worker.memory.energyFillingStructureId) {
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

    if(!worker.memory.isCollectingEnergy) {
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
        worker.say(`res:${fillResult}`);
        if(fillResult === ERR_NOT_IN_RANGE) {
            worker.moveTo(energyFillingStructure);
        }
        else if(fillResult === ERR_NOT_ENOUGH_RESOURCES) {
            worker.memory.isCollectingEnergy = true;
        }
        else if(fillResult === ERR_FULL || fillResult ==ERR_INVALID_TARGET) {
            worker.memory.energyFillingStructureId = undefined;
        }
    }



}

