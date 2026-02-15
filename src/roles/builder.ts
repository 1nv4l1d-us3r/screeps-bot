import { CreepRoles } from "./base";
import { baseHarvesterMemory, harvesterRole } from "./harvester";
import { upgraderRole } from "./upgrader";


export interface baseBuilderMemory extends baseHarvesterMemory{
    targetConstructionSiteId?: Id<ConstructionSite>;
}

interface builderMemory extends baseBuilderMemory{
    role: CreepRoles.BUILDER;
}

export type BuilderCreep = Creep & {
    memory: builderMemory;
}

type BaseBuilderCreep = Creep & {
    memory: baseBuilderMemory;
}


export const builderRole = (creep: BaseBuilderCreep) => {
    creep.say(`builder role: ${CreepRoles.BUILDER}`);
    if(creep.store.getFreeCapacity() === 0) {
        creep.memory.isHarvesting = false;
    }

    if(creep.memory.isHarvesting) {
        harvesterRole(creep);
        return;
    }

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
                creep.memory.isHarvesting = true;
            }
        }
    }
    
    
}