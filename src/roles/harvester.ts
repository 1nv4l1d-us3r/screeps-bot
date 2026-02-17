import { EnergyCollectionMemory } from "../actions/energyCollection";
import { WorkerRoles } from "./base";
import { builderRole } from "./builder";


export interface HarvesterMemory extends EnergyCollectionMemory{
    energyFillingStructureId?: Id<StructureContainer|StructureExtension|StructureTower|StructureSpawn>;
}

// other creeps can inherit from this memory
type BaseHarvester = Creep & {
    memory: HarvesterMemory;
}



export const harvesterRole = (creep:BaseHarvester) => {

    if (!creep.memory.energyFillingStructureId) {
        const energyFillingStructure: StructureSpawn|StructureExtension|StructureTower|null = creep.pos.findClosestByRange(
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
            creep.memory.energyFillingStructureId = energyFillingStructure.id;
        }
        else {
            builderRole(creep);
            return;
        }
    }

    if(creep.memory.energyFillingStructureId) {
        const energyFillingStructure = Game.getObjectById(creep.memory.energyFillingStructureId);
        if(energyFillingStructure) {
            // check if already full
            if(energyFillingStructure.store.energy === energyFillingStructure.store.getCapacity('energy')) {
                creep.memory.energyFillingStructureId = undefined;
                return;
            }
            const fillResult = creep.transfer(energyFillingStructure, RESOURCE_ENERGY);
            if(fillResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(energyFillingStructure);
            }
            else if(fillResult === ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.isCollectingEnergy = true;
            }
            else if(fillResult === ERR_FULL || fillResult ==ERR_INVALID_TARGET) {
                creep.memory.energyFillingStructureId = undefined;
            }
        }
    }



}

