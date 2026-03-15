import { PackedCoord } from "types/geometry";
import { RoomPlanner } from "../planners/roomPlanner";
import { packCoord } from "../../geometry/packedCoords";
import { getMyRooms } from "utils/commonFunctions";
import { Scheduler } from "helpers/Scheduler";
import { TickCache } from "helpers/cache";





interface FindStructureAtTargetParams<S extends StructureConstant>{
    structureType: S;
    packedCoord: PackedCoord;
    structureMap: Map<PackedCoord, Structure>;
}
type FindStructureAtTargetResult<S extends StructureConstant> = Structure<S> | undefined;






export class LogisticsService {

    public static startDeamon(){
        Scheduler.createRecurringJob({
            name: 'LogisticsManagerDeamon',
            interval: 300,
            func: LogisticsService.scheduleStorageProviderIdsUpdate,
        })
    }

    public static scheduleStorageProviderIdsUpdate() {
        Scheduler.createOneTimeJobs({
            list: getMyRooms(),
            nameGenerator: (room) => 'UpdateLogisticsOps-' + room.name,
            delay: 1,
            offset: 2,
            func: (room) => LogisticsService.updateLogisticsOperations(room),
        })
    }


    public static updateLogisticsOperations(room: Room) {
        console.log(`Updating storage provider ids for room ${room.name}`)
        let roomPlan=room.memory.roomPlan
        
        if(!roomPlan) {
            RoomPlanner.updateRoomPlan(room)
            roomPlan=room.memory.roomPlan
            if(!roomPlan) {
                console.error(`Failed to get room plan for room  ${room.name} , skipping logistics reconciliation`);
                return;
            }
        }

        const baseConfig=roomPlan.baseConfig
        const storageCoord=baseConfig.storageCoord
        // const baseLinkCoord=baseConfig.baseLinkCoord  // TODO : handle link structures later
        const tempStorage1Coord=baseConfig.tempStorage1Coord
        const tempStorage2Coord=baseConfig.tempStorage2Coord


        const roomStructures=room.find(FIND_STRUCTURES)
      
        const structureMap=new Map<PackedCoord, Structure>()
        roomStructures.forEach(structure => {
            const structureCoord=packCoord({x:structure.pos.x, y:structure.pos.y})
            structureMap.set(structureCoord, structure)
        })

        const storage = this.findStructureAtTarget({
            structureType: STRUCTURE_STORAGE as StructureConstant,
            packedCoord: packCoord(storageCoord),
            structureMap    
        }) as StructureStorage | undefined

        const tempStorage1 = this.findStructureAtTarget({
            structureType: STRUCTURE_CONTAINER as StructureConstant,
            packedCoord: packCoord(tempStorage1Coord),
            structureMap
        }) as StructureContainer | undefined

        const tempStorage2 = this.findStructureAtTarget({
            structureType: STRUCTURE_CONTAINER as StructureConstant,
            packedCoord: packCoord(tempStorage2Coord),
            structureMap
        }) as StructureContainer | undefined

        const stroageStructures:(StructureStorage|StructureContainer|StructureSpawn)[]=[]

        if(storage) {
            stroageStructures.push(storage)
        }
        if(tempStorage1) {
            stroageStructures.push(tempStorage1)
        }
        if(tempStorage2) {
            stroageStructures.push(tempStorage2)
        }

        if(!stroageStructures.length) {
            const spawns=roomStructures.filter(structure => structure.structureType === STRUCTURE_SPAWN);
            stroageStructures.push(...spawns)
        }

        const storageProviderIds=stroageStructures.map(structure => structure.id)



        let upgraderStorageId:Id<StructureContainer | StructureLink> | undefined=undefined;
        let upgraderStorageType:STRUCTURE_CONTAINER | STRUCTURE_LINK | undefined=undefined;
        const upgraderStorageConfig=roomPlan.logisticsConfig

        if(upgraderStorageConfig.upgraderStorageType) {
            const upgraderStorage=this.findStructureAtTarget({
                structureType: upgraderStorageConfig.upgraderStorageType,
                packedCoord: upgraderStorageConfig.upgraderStoragePackedCoord,
                structureMap
            }) as StructureContainer | StructureLink | undefined
            if(upgraderStorage) {
                upgraderStorageId=upgraderStorage.id
                upgraderStorageType=upgraderStorageConfig.upgraderStorageType
            }
        }

        room.memory.logistics={
            storageProviderIds,
            upgraderStorageId,
            upgraderStorageType
        }


    }



        // utility function
    private static findStructureAtTarget<S extends StructureConstant>(
        params: FindStructureAtTargetParams<S>
    ): FindStructureAtTargetResult<S> {

        const {structureType, packedCoord, structureMap}=params

        const structureAtTarget=structureMap.get(packedCoord)
        if(!structureAtTarget) {
            return undefined
        }
        if(structureAtTarget.structureType== structureType) {
            return structureAtTarget as Structure<S>
        }
        return undefined
    }


   


}


export class LogisticsManager extends LogisticsService{


    private static getLogisticsOps(room: Room) {
        let logistics=room.memory.logistics
        if(!logistics) {
            LogisticsManager.updateLogisticsOperations(room)
            logistics=room.memory.logistics
        }
        return logistics
    }


    public static getResourceWithdrawStructures(room: Room,resourceType: ResourceConstant) {
        let logistics=LogisticsManager.getLogisticsOps(room)
        if(!logistics) {
            return []
        }
        const storageProviders:(StructureStorage|StructureContainer|StructureSpawn)[]=[]

        logistics.storageProviderIds.forEach(providerId => {
            const provider=Game.getObjectById(providerId)
            if(!provider) {
                LogisticsManager.updateLogisticsOperations(room)
                return storageProviders
            }
            if(
                provider.structureType === STRUCTURE_SPAWN &&
                provider.store.energy > 50 &&
                resourceType === RESOURCE_ENERGY
            ) {
                storageProviders.push(provider)
                return;
            }

            if(provider.store.getUsedCapacity(resourceType) > 0) {
                storageProviders.push(provider)
            }
        })

        return storageProviders;
    }


    public static getResourceStorageStructures(room: Room,resourceType: ResourceConstant) {
        let logistics=LogisticsManager.getLogisticsOps(room)
        if(!logistics) {
            return []
        }
        const storageProviders:(StructureStorage|StructureContainer|StructureSpawn)[]=[]
        logistics.storageProviderIds.forEach(providerId => {
            const provider=Game.getObjectById(providerId)
            if(!provider) {
                LogisticsManager.updateLogisticsOperations(room)
                return  
            }
            if(provider.structureType === STRUCTURE_SPAWN  && resourceType === RESOURCE_ENERGY) {
                storageProviders.push(provider)
                return; 
            }
            if(provider.store.getUsedCapacity(resourceType) < provider.store.getCapacity(resourceType)) {
                storageProviders.push(provider)
            }
        })
        return storageProviders
    }

    
    public static getUpgraderStorage(room: Room) {
        let logistics=LogisticsManager.getLogisticsOps(room)
        if(!logistics || !logistics.upgraderStorageId) {
            return 
        }
        const upgraderStorage=Game.getObjectById(logistics.upgraderStorageId)
        return upgraderStorage
    }




    private static TOWER_FILL_THRESHOLD=0.8;
    private static UPGRADER_STORAGE_FILL_THRESHOLD=0.8;




    @TickCache((room: Room) => room.name)
    public static getEnergyConsumers(room: Room) {
        let logistics=LogisticsManager.getLogisticsOps(room)
        if(!logistics) {
            return []
        }

        const roomStructures=room.find(FIND_STRUCTURES)

        const extensionsAndSpawns: (StructureExtension|StructureSpawn)[]=[]

        const otherEnergyConsumers: (StructureTower|StructureContainer)[]=[]


        roomStructures.forEach(structure => {
            if(
                    (structure.structureType === STRUCTURE_EXTENSION 
                    || structure.structureType === STRUCTURE_SPAWN
                    ) && structure.store.energy < structure.store.getCapacity('energy')
                ) {
                extensionsAndSpawns.push(structure)
            }
            else if(
                    structure.structureType === STRUCTURE_TOWER 
                    && structure.store.getUsedCapacity('energy') < LogisticsManager.TOWER_FILL_THRESHOLD * structure.store.getCapacity('energy')
            ) {
                otherEnergyConsumers.push(structure)

            }
        })

        if(extensionsAndSpawns.length) {
            return extensionsAndSpawns
        }
        else{

            if(logistics.upgraderStorageType===STRUCTURE_CONTAINER) {
                const upgraderStorage=Game.getObjectById(logistics.upgraderStorageId)
                if(upgraderStorage && upgraderStorage.structureType === STRUCTURE_CONTAINER){
                    if(upgraderStorage.store.getUsedCapacity('energy') < LogisticsManager.UPGRADER_STORAGE_FILL_THRESHOLD * upgraderStorage.store.getCapacity('energy')) {
                        otherEnergyConsumers.push(upgraderStorage)
                    }
                }
            }

            return otherEnergyConsumers

        }
    }
}