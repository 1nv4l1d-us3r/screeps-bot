import { packCoord,getAlternateSpiralCoords, unpackCoord } from "../../../geometry";
import { getMaxBuildableStructuresByLevel } from "../../../utils/gameConstants";

import {  getTowerConstructionCoords } from "./towers";
import { RoomPlanner } from "../../planners/roomPlanner";

import { Coord, PackedCoord } from "../../../types/geometry";
import { ConstructionRequest } from "../../../types/room/managers";
import { Scheduler } from "helpers/Scheduler";
import { getMyRooms } from "utils/commonFunctions";

import { TickCache } from "helpers/cache";




const constructionPriorityMap: Partial<Record<BuildableStructureConstant, number>>={
    [STRUCTURE_SPAWN]:1,
    [STRUCTURE_EXTENSION]:2,
    [STRUCTURE_CONTAINER]:3,
    [STRUCTURE_TOWER]:4,
    [STRUCTURE_STORAGE]:5,
    [STRUCTURE_EXTRACTOR]:6,
    [STRUCTURE_ROAD]:8,
}




export class ConstructionManager {

    private static CONSTRUCTION_SITES_BATCH_SIZE=5;



    public static startDeamon(){
        Scheduler.createRecurringJob({
            name: 'ConstructionManagerDeamon',
            interval: 100,
            func: ConstructionManager.startConstructionJobs,
        })
    }
    
    public static startConstructionJobs(){
        Scheduler.createOneTimeJobs({
            list: getMyRooms(),
            nameGenerator: (room) => 'ConstructionQueuePopulation-' + room.name,
            delay:1,
            offset:2,
            func: (room) => ConstructionManager.populateConstructionQueue(room),
        })
    }

    public static populateConstructionQueue(room: Room){

        const constructionQueue:ConstructionRequest[]=[];

        const roomLevel = room.controller?.level || 0;
        const roomTerrain = room.getTerrain();

        let roomPlan=room.memory.roomPlan

        if(!roomPlan) {
            const newRoomPlan=RoomPlanner.getRoomPlan(room);
            roomPlan=newRoomPlan;
        }

        const primarySpawnCoord=roomPlan.baseConfig.primarySpawnCoord;

        const roomStructures = room.find(FIND_STRUCTURES);
        const roomConstructionsSites=room.find(FIND_CONSTRUCTION_SITES);
        // TODO: use cache provider to get the room structures and construction sites


        const occupiedPackedCoordsSet=new Set<PackedCoord>();
        const roomStructureMap=new Map<PackedCoord, StructureConstant>();
        const roomConstructionSiteMap=new Map<PackedCoord, BuildableStructureConstant>();

        roomStructures.forEach(st => {
            const structureCoord=packCoord({x:st.pos.x, y:st.pos.y});
            occupiedPackedCoordsSet.add(structureCoord);
            roomStructureMap.set(structureCoord, st.structureType);
        });
        roomConstructionsSites.forEach(cs => {
            const constructionSiteCoord=packCoord({x:cs.pos.x, y:cs.pos.y});
            occupiedPackedCoordsSet.add(constructionSiteCoord);
            roomConstructionSiteMap.set(constructionSiteCoord, cs.structureType);
        });



        
        const spawns=roomStructures.filter(st => st.structureType === STRUCTURE_SPAWN);
        const constructingSpawns=roomConstructionsSites.filter(cs => cs.structureType === STRUCTURE_SPAWN);

        // ------------- First Spawn Construction -------------//
        if(spawns.length===0 && constructingSpawns.length===0) {
            const firstSpawnConstructionRequest:ConstructionRequest={
                coord:primarySpawnCoord,
                structureType:STRUCTURE_SPAWN,
                replaceExisting:true,
            }
            constructionQueue.push(firstSpawnConstructionRequest);
            occupiedPackedCoordsSet.add(packCoord(primarySpawnCoord));
        }

        // ------------- Additional Spawns Construction -------------//
        const totalSpawnsCount=spawns.length+constructingSpawns.length;
        const maxSpawnsCount=getMaxBuildableStructuresByLevel(STRUCTURE_SPAWN, roomLevel);
        if(totalSpawnsCount < maxSpawnsCount) {
            const spawnsNeededCount=maxSpawnsCount-totalSpawnsCount;
            console.log(`need to construct ${spawnsNeededCount} spawns in room ${room.name}`);



            try{
                const spawnPlacementCoords=getAlternateSpiralCoords({
                    center:primarySpawnCoord,
                    neededCount:spawnsNeededCount,
                    roomTerrain,
                    occupiedPackedCoordsSet,
                });

                spawnPlacementCoords.forEach(coord => {
                    const spawnConstructionRequest:ConstructionRequest={
                        coord,
                        structureType:STRUCTURE_SPAWN,
                        replaceExisting:true,
                    }
                    constructionQueue.push(spawnConstructionRequest);
                    occupiedPackedCoordsSet.add(packCoord(coord));
                });
            }
            catch(error) {
                console.error(JSON.stringify({error}, null, 2));
            }
        }
        // ------------------ X ---------------------//



        // ------------- Extension Construction -------------//


        const extensions=roomStructures.filter(st => st.structureType === STRUCTURE_EXTENSION);
        const constructingExtensions=roomConstructionsSites.filter(cs => cs.structureType === STRUCTURE_EXTENSION);
        const totalExtensionsCount=extensions.length+constructingExtensions.length; 
        const maxExtensionsCount=getMaxBuildableStructuresByLevel(STRUCTURE_EXTENSION, roomLevel);
        if(totalExtensionsCount < maxExtensionsCount) {
            const extensionsNeededCount=maxExtensionsCount-totalExtensionsCount;
            console.log(`need to construct ${extensionsNeededCount} extensions in room ${room.name}`);

            const extensionPlacementCoords=getAlternateSpiralCoords({
                center:primarySpawnCoord,
                neededCount:extensionsNeededCount,
                roomTerrain,
                occupiedPackedCoordsSet,
            });

            extensionPlacementCoords.forEach(coord => {
                const extensionConstructionRequest:ConstructionRequest={
                    coord,
                    structureType:STRUCTURE_EXTENSION,
                }
                constructionQueue.push(extensionConstructionRequest);
                occupiedPackedCoordsSet.add(packCoord(coord));
            });
        }

        // ------------------ X ---------------------//


        const storage=room.storage;
        const maxStorageCount=getMaxBuildableStructuresByLevel(STRUCTURE_STORAGE, roomLevel);


        // ----------------- Storage Construction ----------------//
        if(!storage && maxStorageCount > 0) {

            const storageCoord=roomPlan.baseConfig.storageCoord;
            const storageConstructionRequest:ConstructionRequest={
                coord:storageCoord,
                structureType:STRUCTURE_STORAGE,
                replaceExisting:true,
            }
            constructionQueue.push(storageConstructionRequest);
            occupiedPackedCoordsSet.add(packCoord(storageCoord));
        }
        // ------------------ X ---------------------//


        // ----------------- Upgrader Container Construction ----------------//

        const logisticsConfig=roomPlan.logisticsConfig;

        const {upgraderStoragePackedCoord,upgraderStorageType}=logisticsConfig;

        if(upgraderStorageType) {

            const upgraderContainerExists=roomStructureMap.get(upgraderStoragePackedCoord) === upgraderStorageType;
            const constructionSiteExists=roomConstructionSiteMap.get(upgraderStoragePackedCoord) === upgraderStorageType;

            if(!upgraderContainerExists && !constructionSiteExists) {
                const upgraderContainerConstructionRequest:ConstructionRequest={
                    coord:unpackCoord(upgraderStoragePackedCoord),
                    structureType:upgraderStorageType,
                    replaceExisting:true,
                }
                constructionQueue.push(upgraderContainerConstructionRequest);
                occupiedPackedCoordsSet.add(upgraderStoragePackedCoord);
            }
        }



        // ------------------ X ---------------------//






        const miningConfig=roomPlan.miningConfig

        // ----------------- Mining Utility Structures Construction ----------------//

        for(const miningSiteConfig of miningConfig) {
            const { storageCoord, storageType,extractorCoord } = miningSiteConfig;
            if(storageCoord && storageType) {
                const storageCoordPacked=packCoord(storageCoord);
                const storageExists=roomStructureMap.get(storageCoordPacked) === storageType;
                const constructionSiteExists=roomConstructionSiteMap.get(storageCoordPacked) === storageType;

                if(!storageExists && !constructionSiteExists) {
                    const storageConstructionRequest:ConstructionRequest={
                        coord:storageCoord,
                        structureType:storageType,
                        replaceExisting:true,
                    }
                    constructionQueue.push(storageConstructionRequest);
                    occupiedPackedCoordsSet.add(storageCoordPacked);
                }
            }

            if(extractorCoord) {
                const extractorCoordPacked=packCoord(extractorCoord);
                const extractorExists=roomStructureMap.get(extractorCoordPacked) === STRUCTURE_EXTRACTOR;
                const constructionSiteExists=roomConstructionSiteMap.get(extractorCoordPacked) === STRUCTURE_EXTRACTOR;

                if(!extractorExists && !constructionSiteExists) {
                    const extractorConstructionRequest:ConstructionRequest={
                        coord:extractorCoord,
                        structureType:STRUCTURE_EXTRACTOR,
                        replaceExisting:true,
                    }
                    constructionQueue.push(extractorConstructionRequest);
                    occupiedPackedCoordsSet.add(extractorCoordPacked);
                }
            }
        }

        // ------------------ X ---------------------//




        // ----------------- Towers Construction ----------------//
        const towers=roomStructures.filter(st => st.structureType === STRUCTURE_TOWER);
        const constructingTowers=roomConstructionsSites.filter(cs => cs.structureType === STRUCTURE_TOWER);

        const totalTowersCount=towers.length+constructingTowers.length;
        const maxTowersCount=getMaxBuildableStructuresByLevel(STRUCTURE_TOWER, roomLevel);
        if(totalTowersCount < maxTowersCount) {
            const towersNeededCount=maxTowersCount-totalTowersCount;

            const assumedTowerSites=[...towers,...constructingTowers];
            const assumedTowerCoords:Coord[]=assumedTowerSites.map(tower => ({x:tower.pos.x, y:tower.pos.y}));

            const towersConstructionCoords=getTowerConstructionCoords({
                baseCenterCoord:primarySpawnCoord,
                roomTerrain,
                occupiedPackedCoordsSet,
                existingTowerCoords:assumedTowerCoords,
                towersNeededCount,
            });

            towersConstructionCoords.forEach(coord => {
                const towerConstructionRequest:ConstructionRequest={
                    coord,
                    structureType:STRUCTURE_TOWER,
                    replaceExisting:true,
                }
                constructionQueue.push(towerConstructionRequest);
                occupiedPackedCoordsSet.add(packCoord(coord));
            });

        }

        // ------------------ X ---------------------//


        constructionQueue.sort((a,b) => {
            const aPriority=constructionPriorityMap[a.structureType];
            const bPriority=constructionPriorityMap[b.structureType];
            return aPriority - bPriority;
        });

        const constructionSiteIds=roomConstructionsSites.map(cs => cs.id);


        room.memory.construction={
            constructionQueue,
            constructionSiteIds,
        }
    }


    



    @TickCache((room: Room) => room.name)
    public static getConstructionSites(room: Room){
        const ConstructionOperation=room.memory.construction
        if(!ConstructionOperation) {
            ConstructionManager.populateConstructionQueue(room);
            return [];
        }
        const constructionQueue=ConstructionOperation.constructionQueue;
        let constructionSiteIds:Id<ConstructionSite>[]=ConstructionOperation?.constructionSiteIds || [];
       
        if(!constructionSiteIds.length && constructionQueue.length) {

            const windowedConstructionRequests=constructionQueue.splice(0,ConstructionManager.CONSTRUCTION_SITES_BATCH_SIZE-1);

            windowedConstructionRequests.forEach(request => {
                ConstructionManager.createConstructionSites(room, request);
            })

            Scheduler.createOneTimeJob({
                name: 'constructionSiteIdsPopulation-' + room.name,
                delay: 1,
                func: () => {
                    const constructionSites=room.find(FIND_MY_CONSTRUCTION_SITES);
                    constructionSiteIds=constructionSites.map(cs => cs.id);
                    room.memory.construction.constructionSiteIds=constructionSiteIds;
                }
            });
            return [];
        
        }

        if(constructionSiteIds.length) {

            const constructionSites:ConstructionSite[]=[]
            const validConstructionSiteIds:Id<ConstructionSite>[]=[];

            constructionSiteIds.forEach(id => {
                const constructionSite=Game.getObjectById(id);
                if(constructionSite) {
                    constructionSites.push(constructionSite);
                    validConstructionSiteIds.push(id);
                }
            });

            if(validConstructionSiteIds.length !== constructionSiteIds.length) {
                // only update const-site ids if some of them are invalid
                room.memory.construction.constructionSiteIds=validConstructionSiteIds;
            }
            return constructionSites;
        }
        
        return [];
    }


  



    private static createConstructionSites(room: Room, constructionRequest: ConstructionRequest){

        const {coord, structureType, replaceExisting}=constructionRequest;

        const constructionResult=room.createConstructionSite(coord.x, coord.y, structureType);
        if(constructionResult === OK) {
            return true;
        }
        else if(replaceExisting === true && constructionResult === ERR_INVALID_TARGET) {
            const existingStructure = room.lookForAt(LOOK_STRUCTURES, coord.x, coord.y);
            existingStructure.forEach(st=>st.destroy())


            // try to create the construction site after destroying the existing structure
            Scheduler.createOneTimeJob({
                name: 'ConstructionSiteCreation-' + coord.x + '-' + coord.y,
                delay: 1,
                func: () => {
                    room.createConstructionSite(coord.x, coord.y, structureType);
                }
               });
            return false;
        }
        else {
            return false;
        }
    }




}