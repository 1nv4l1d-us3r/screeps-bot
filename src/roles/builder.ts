import { upgraderRole } from "./upgrader";
import { Worker } from "types/worker";
import { BuilderMemory } from "types/roles";
import { TasksType, WithdrawResourceTask } from "types/tasks";
import { WorkerRoles } from "types/roles";

type BuilderWorker = Worker<WorkerRoles.BUILDER>;


import { ConstructionManager } from "room/managers/constructionManager";


export const builderRole = (worker: BuilderWorker) => {
    const memory = worker.memory;
    const roleMemory = memory.roleMemory as BuilderMemory;

    if(!roleMemory.targetConstructionSiteId) {
        const constructionSites=ConstructionManager.getConstructionSites(worker.room);
        if(!constructionSites.length) {
            upgraderRole(worker as Worker);
            return;
        }
        constructionSites.sort((a,b) => {
            const aDistance=a.pos.getRangeTo(worker.pos);
            const bDistance=b.pos.getRangeTo(worker.pos);
            return aDistance - bDistance;
        });
        const closestConstructionSite = constructionSites[0];

        roleMemory.targetConstructionSiteId = closestConstructionSite.id;

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
                const withdrawEnergyTask: WithdrawResourceTask = {
                    taskType: TasksType.WITHDRAW_RESOURCE,
                    data: {
                        withdrawStructureId: 'auto',
                        resourceType: RESOURCE_ENERGY,
                    }
                }
                memory.task = withdrawEnergyTask;
                return;
            }
        }
    }
    
    
}