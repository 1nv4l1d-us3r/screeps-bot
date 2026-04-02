import { Worker } from "types/worker";
import { WorkerRoles } from "types/roles";
import { Coord } from "types/geometry";
import { 
    TasksType, 
    WithdrawResourceTask, 
    PickupResourceTask,
    TransferResourceTask,
    Task,
} from "types/tasks";
import { LogisticsManager } from "room/managers/logisticsManager";

type MineHaulerWorker = Worker<WorkerRoles.HAULER>;

export class MineHauler {





    

    private static findWithdrawStructure(worker: MineHaulerWorker, storageCoord: Coord) {
        const storageStructures=worker.room.lookForAt(LOOK_STRUCTURES, storageCoord.x, storageCoord.y)
        const structureContainer = storageStructures.find
            ((st) => st.structureType === STRUCTURE_CONTAINER) as StructureContainer|undefined;
        return structureContainer;
    }

    private static findDroppedResource(worker: MineHaulerWorker, miningCoord: Coord) {
        const droppedResources=worker.room.lookForAt(LOOK_RESOURCES, miningCoord.x, miningCoord.y)
        if(droppedResources.length > 0) {
            const resource =droppedResources.shift()
            return resource;
        }
    }


    public static handleMineHaulerRole(worker: MineHaulerWorker) {
        const memory = worker.memory;
        const roleMemory=memory.roleMemory



        if(!roleMemory.withdrawStructureId && !roleMemory.droppedResourceId) {

            const droppedResource = MineHauler.findDroppedResource(worker, roleMemory.miningCoord);
            if(droppedResource) {
                roleMemory.droppedResourceId = droppedResource.id;
            }
            else if( roleMemory.storageCoord){
                const withdrawStructure = MineHauler.findWithdrawStructure(worker, roleMemory.storageCoord);
                if(withdrawStructure) {
                    roleMemory.withdrawStructureId = withdrawStructure.id;
                }
            }
        }

        if(worker.store.getUsedCapacity()<worker.store.getCapacity()) {

            let haulerTask: Task<TasksType.PICKUP_RESOURCE> | Task<TasksType.WITHDRAW_RESOURCE> | undefined;

            if(roleMemory.droppedResourceId){
                const droppedResource = Game.getObjectById(roleMemory.droppedResourceId);
                if(!droppedResource) {
                    roleMemory.droppedResourceId = undefined;
                    return;
                }

                const pickupResourceTask: PickupResourceTask = {
                    taskType: TasksType.PICKUP_RESOURCE,
                    data: {
                        droppedResourceId: roleMemory.droppedResourceId as Id<Resource>,
                    }
                }
                haulerTask = pickupResourceTask;
            }
            else if(roleMemory.withdrawStructureId){
                const withdrawStructure = Game.getObjectById(roleMemory.withdrawStructureId);
                if(!withdrawStructure) {
                    roleMemory.withdrawStructureId = undefined;
                    return;
                }
                const withdrawResourceTask: WithdrawResourceTask = {
                    taskType: TasksType.WITHDRAW_RESOURCE,
                    data: {
                        withdrawStructureId: roleMemory.withdrawStructureId as Id<StructureContainer|StructureStorage>,
                        resourceType: roleMemory.resourceType,
                    }
                }
                haulerTask = withdrawResourceTask;
            }
            if(haulerTask) {
                worker.memory.task = haulerTask;
            }
        }



        if(worker.store.getUsedCapacity()==worker.store.getCapacity()) {
            
            const storageTask: TransferResourceTask = {
                taskType: TasksType.TRANSFER_RESOURCE,
                data: {
                    targetStructureId: 'auto',
                    resourceType: roleMemory.resourceType
                }
            }
            worker.memory.task = storageTask;
        }


    }
}