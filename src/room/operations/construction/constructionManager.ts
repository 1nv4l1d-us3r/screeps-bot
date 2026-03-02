import { packCoord,getAlternateSpiralCoords } from "../../../geometry";
import { getMaxBuildableStructuresByLevel } from "../../../gameConstants";

import {  getTowerConstructionCoords } from "./towers";
import { RoomPlanner } from "../../planners/roomPlanner";

import { Coord, PackedCoord } from "../../../types/geometry";
import { ConstructionRequest } from "../../../types/room/managers";




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


    public static getConstructionRequestsForRoom(room: Room): ConstructionRequest[] {

        const constructionRequests:ConstructionRequest[]=[];

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
            constructionRequests.push(firstSpawnConstructionRequest);
            occupiedPackedCoordsSet.add(packCoord(primarySpawnCoord));
        }

        // ------------- Additional Spawns Construction -------------//
        const totalSpawnsCount=spawns.length+constructingSpawns.length;
        const maxSpawnsCount=getMaxBuildableStructuresByLevel(STRUCTURE_SPAWN, roomLevel);
        if(totalSpawnsCount < maxSpawnsCount) {
            const spawnsNeededCount=maxSpawnsCount-totalSpawnsCount;
            console.log(`need to construct ${spawnsNeededCount} spawns in room ${room.name}`);


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
                constructionRequests.push(spawnConstructionRequest);
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
            constructionRequests.push(storageConstructionRequest);
            occupiedPackedCoordsSet.add(packCoord(storageCoord));
        }
        // ------------------ X ---------------------//

        const miningConfig=roomPlan.miningConfig

        // ----------------- Mining Utility Structures Construction ----------------//

        for(const miningSiteConfig of miningConfig) {
            const { storageCoord, storageType } = miningSiteConfig;
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
                    constructionRequests.push(storageConstructionRequest);
                    occupiedPackedCoordsSet.add(storageCoordPacked);
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
                constructionRequests.push(towerConstructionRequest);
                occupiedPackedCoordsSet.add(packCoord(coord));
            });

        }

        // ------------------ X ---------------------//





        return constructionRequests;
    }


    public static updateConstructionRequestsForRoom(room: Room): void {
        const constructionRequests=this.getConstructionRequestsForRoom(room);

        room.memory.roomOperations={
            constructionRequests,
        }


       
    }

}