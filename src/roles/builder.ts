import { collectEnergy, EnergyCollectionMemory } from "../actions/energyCollection";
import { WorkerRoles } from "./base";
import { baseHarvesterMemory, harvesterRole } from "./harvester";
import { upgraderRole } from "./upgrader";


export interface baseBuilderMemory extends EnergyCollectionMemory{
    targetConstructionSiteId?: Id<ConstructionSite>;
}

interface builderMemory extends baseBuilderMemory{
    role: WorkerRoles.BUILDER;
}

export type Builder = Creep & {
    memory: builderMemory;
}

type BaseBuilder = Creep & {
    memory: baseBuilderMemory;
}


export const builderRole = (creep: BaseBuilder) => {

    if(!creep.memory.targetConstructionSiteId) {
        const closestConstructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if(closestConstructionSite) {
            creep.memory.targetConstructionSiteId = closestConstructionSite.id;
        }
        else {
            creep.say('no construction sites found, upgrading controller');
            upgraderRole(creep);
            return;
        }
    }

    if(creep.memory.targetConstructionSiteId) {
        const constructionSite = Game.getObjectById(creep.memory.targetConstructionSiteId);
        if(constructionSite) {
            const buildResult = creep.build(constructionSite);
            if(buildResult === ERR_NOT_IN_RANGE) {
                creep.moveTo(constructionSite);
            }
            else if(buildResult === ERR_INVALID_TARGET) {
                creep.memory.targetConstructionSiteId = undefined;
            }
            else if(buildResult === ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.isCollectingEnergy = true;
            }
        }
    }
    
    
}