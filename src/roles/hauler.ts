import { Worker } from "types/worker";
import { WorkerRoles } from "types/roles";
import { MineHaulerMemory } from "types/roles";
import { Coord } from "types/geometry";
import { 
    TasksType, 
    WithdrawEnergyTask, 
    PickupResourceTask,
    TransferResourceTask,
} from "types/tasks";
import { LogisticsManager } from "room/managers/logisticsmanager";

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


        if(roleMemory.storageCoord && !roleMemory.withdrawStructureId) {
            const withdrawStructure = this.findWithdrawStructure(worker, roleMemory.storageCoord);
            if(withdrawStructure) {
                roleMemory.withdrawStructureId = withdrawStructure.id;
                roleMemory.droppedResourceId=undefined
            }
            else {
                roleMemory.storageCoord = undefined;
                roleMemory.withdrawStructureId = undefined;
            }
        }

    

        if(!roleMemory.storageCoord && !roleMemory.droppedResourceId) {
            const droppedResource = this.findDroppedResource(worker, roleMemory.miningCoord);
            if(droppedResource) {
                roleMemory.droppedResourceId = droppedResource.id;
            }
        }


        if(worker.store.getUsedCapacity() === 0) {

            if(roleMemory.withdrawStructureId) {
                const withdrawEnergyTask: WithdrawEnergyTask = {
                    taskType: TasksType.WITHDRAW_ENERGY,
                    data: {
                        withdrawStructureId: roleMemory.withdrawStructureId as Id<StructureContainer|StructureStorage>,
                    }
                }
                worker.memory.task = withdrawEnergyTask;
                return 
            }
            else if(roleMemory.droppedResourceId) {
                const pickupResourceTask: PickupResourceTask = {
                    taskType: TasksType.PICKUP_RESOURCE,
                    data: {
                        droppedResourceId: roleMemory.droppedResourceId as Id<Resource>,
                    }
                }
                worker.memory.task = pickupResourceTask;
                return;
            }
        }
        worker.say(`${worker.store.getFreeCapacity().toString()}`)

        if(worker.store.getFreeCapacity() === 0) {
            
            const storageStructures = LogisticsManager.getResourceTransferStructures(worker.room);
            storageStructures.sort((a,b)=>a.pos.getRangeTo(worker.pos)-b.pos.getRangeTo(worker.pos))
            const closestStorageStructure = storageStructures[0]
            if(closestStorageStructure) {
                const transferResourceTask: TransferResourceTask = {
                    taskType: TasksType.TRANSFER_RESOURCE,
                    data: {
                        targetStructureId: closestStorageStructure.id,
                        resourceType: RESOURCE_ENERGY,
                    }
                }
                worker.memory.task = transferResourceTask;
                return;
            }
        }




    }
}