import { upgraderRole } from "./upgrader";
import { BaseWorker, BuilderMemory } from "../types/worker";


type BaseBuilder = BaseWorker<BuilderMemory>;


export const builderRole = (worker: BaseBuilder) => {

    if(!worker.memory.targetConstructionSiteId) {
        const closestConstructionSite = worker.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if(closestConstructionSite) {
            worker.memory.targetConstructionSiteId = closestConstructionSite.id;
        }
        else {
            upgraderRole(worker);
            return;
        }
    }

    if(worker.memory.targetConstructionSiteId) {
        const constructionSite = Game.getObjectById(worker.memory.targetConstructionSiteId);
        if(!constructionSite) {
            worker.memory.targetConstructionSiteId = undefined;
            return;
        }
        if(constructionSite) {
            const buildResult = worker.build(constructionSite);
            if(buildResult === ERR_NOT_IN_RANGE) {
                worker.moveTo(constructionSite);
            }
            else if(buildResult === ERR_INVALID_TARGET) {
                worker.memory.targetConstructionSiteId = undefined;
            }
            else if(buildResult === ERR_NOT_ENOUGH_RESOURCES) {
                worker.memory.isCollectingEnergy = true;
            }
        }
    }
    
    
}