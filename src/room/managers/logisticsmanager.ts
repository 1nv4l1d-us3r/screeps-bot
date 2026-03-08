import { PackedCoord } from "types/geometry";
import { RoomPlanner } from "../planners/roomPlanner";
import { packCoord } from "../../geometry/packedCoords";
import { getMyRooms } from "utils/commonFunctions";
import { Scheduler } from "helpers/Scheduler";



interface FindStructureAtTargetParams<S extends StructureConstant>{
    structureType: S;
    packedCoord: PackedCoord;
    structureMap: Map<PackedCoord, Structure>;
}
type FindStructureAtTargetResult<S extends StructureConstant> = Structure<S> | undefined;


export class LogisticsManager {


    public static startDeamon(){
        Scheduler.createRecurringJob({
            name: 'LogisticsManagerDeamon',
            interval: 300,
            func: LogisticsManager.startRoomLogisticsCheckingJobs,
        })
    }


    public static startRoomLogisticsCheckingJobs() {
        Scheduler.createOneTimeJobs({
            list: getMyRooms(),
            nameGenerator: (room) => 'UpdateStorageProviderIds-' + room.name,
            delay: 1,
            offset: 2,
            func: (room) => LogisticsManager.updateStorageProviderIds(room),
        })
    }

    public static updateStorageProviderIds(room: Room) {
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

        room.memory.logistics={
            storageProviderIds
        }


    }




    // util functions
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



    public static getResourceWithdrawStructures(room: Room,resourceType: ResourceConstant) {
        let logistics=room.memory.logistics
        if(!logistics) {
            LogisticsManager.updateStorageProviderIds(room)
            logistics=room.memory.logistics
            if(!logistics) {
                console.error(`Failed to get logistics for room  ${room.name} , skipping storage providers check`);
                return []
            }
        }

        const storageProviders:(StructureStorage|StructureContainer|StructureSpawn)[]=[]


        logistics.storageProviderIds.forEach(providerId => {
            const provider=Game.getObjectById(providerId)
            if(!provider) {
                LogisticsManager.updateStorageProviderIds(room)
                return storageProviders
            }

            if(provider.store.getUsedCapacity(resourceType) > 0) {
                storageProviders.push(provider)
            }
        })

        return storageProviders;
    }


    public static getResourceTransferStructures(room: Room) {
        let logistics=room.memory.logistics
        if(!logistics) {
            LogisticsManager.updateStorageProviderIds(room)
            logistics=room.memory.logistics
            if(!logistics) {
                console.error(`Failed to get logistics for room  ${room.name} , skipping storage providers check`);
                return []
            }
        }
        const storageProviders:(StructureStorage|StructureContainer|StructureSpawn)[]=[]
        logistics.storageProviderIds.forEach(providerId => {
            const provider=Game.getObjectById(providerId)
            if(!provider) {
                LogisticsManager.updateStorageProviderIds(room)
                return storageProviders
            }
            if(provider.store.getFreeCapacity() > 0) {
                storageProviders.push(provider)
            }
        })
        return storageProviders
    }
}