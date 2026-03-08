import { upgraderRole } from "./upgrader";
import { Worker } from "types/worker";
import { BuilderMemory } from "types/roles";
import { TasksType, WithdrawEnergyTask } from "types/tasks";
import { WorkerRoles } from "types/roles";

type BuilderWorker = Worker<WorkerRoles.BUILDER>;


export const builderRole = (worker: BuilderWorker) => {
    const memory = worker.memory;
    const roleMemory = memory.roleMemory as BuilderMemory;

    if(!roleMemory.targetConstructionSiteId) {
        const closestConstructionSite = worker.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if(closestConstructionSite) {
            roleMemory.targetConstructionSiteId = closestConstructionSite.id;
        }
        else {
            upgraderRole(worker as Worker);
            return;
        }
    }

    if(roleMemory.targetConstructionSiteId) {
        const constructionSite = Game.getObjectById(roleMemory.targetConstructionSiteId);
        if(!constructionSite) {
            roleMemory.targetConstructionSiteId = undefined;
            return;
        }
        if(constructionSite) {
            const buildResult = worker.build(constructionSite);
            if(buildResult === ERR_NOT_IN_RANGE) {
                worker.moveTo(constructionSite);
            }
            else if(buildResult === ERR_INVALID_TARGET) {
                roleMemory.targetConstructionSiteId = undefined;
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