import { upgraderRole } from "./upgrader";
import { BaseWorker } from "types/worker";
import { BuilderMemory } from "types/roles";
import { TasksType, WithdrawEnergyTask } from "types/tasks";


type BaseBuilder = BaseWorker<BuilderMemory>;


export const builderRole = (worker: BaseBuilder) => {
    const memory = worker.memory;

    if(!memory.targetConstructionSiteId) {
        const closestConstructionSite = worker.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if(closestConstructionSite) {
            worker.memory.targetConstructionSiteId = closestConstructionSite.id;
        }
        else {
            upgraderRole(worker);
            return;
        }
    }

    if(memory.targetConstructionSiteId) {
        const constructionSite = Game.getObjectById(memory.targetConstructionSiteId);
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
                const withdrawEnergyTask: WithdrawEnergyTask = {
                    taskType: TasksType.WITHDRAW_ENERGY,
                    data: {
                    }
                }
                memory.task = withdrawEnergyTask;
                return;
            }
        }
    }
    
    
}