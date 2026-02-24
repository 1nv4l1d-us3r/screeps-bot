import { getMaxBuildableStructuresByLevel } from "../gameConstants";


import { getExtensionsConstructionsCoords } from "./extensions";
import { getTowerConstructionsCoords } from "./towers";
import { findCenterCoord, packCoord } from "../geometry";
import { getFirstSpawnConstructionCoord } from "./spawn";
import { Coord, PackedCoord } from "../types/geometry";
import { constructStructuresAtCoords } from "./common";
import { getStorageStructureConfig } from "./storage";
import { getMiningStorageStructureConfigs } from "./miningStorage";


export const constructStructuresInRoom = (room: Room) => {

    const roomLevel = room.controller?.level || 0;
    const roomTerrain = room.getTerrain();
    
    const roomStructures = room.find(FIND_STRUCTURES);
    const roomConstructionsSites=room.find(FIND_CONSTRUCTION_SITES);

    const existingStructures=[...roomStructures, ...roomConstructionsSites];

    


    const occupiedPackedCoordsSet = new Set<PackedCoord>()
    
    existingStructures.forEach(st => {
        occupiedPackedCoordsSet.add(packCoord({x:st.pos.x, y:st.pos.y}));
    });

    


    // --------------- Spawns Construction ---------------//
    const spawns=roomStructures.filter(st => st.structureType === STRUCTURE_SPAWN);

    if(spawns.length === 0) {
        const isFirstSpawnBeingConstructed=roomConstructionsSites.some(cs => cs.structureType === STRUCTURE_SPAWN);
        if(isFirstSpawnBeingConstructed) {
            console.log(`Room ${room.name}: first spawn is being constructed, skipping construction`);
            return;
        }

        const firstSpawnCoord=getFirstSpawnConstructionCoord({
            room,
            roomTerrain,
            occupiedPackedCoordsSet,
        });
        if(!firstSpawnCoord) {
            console.log(`Room ${room.name}: no first spawn construction position found`);
            return;
        }

        constructStructuresAtCoords({
            room,
            constructionCoords:firstSpawnCoord,
            structureType:STRUCTURE_SPAWN,
            onSuccess:(successCoord) => {
                occupiedPackedCoordsSet.add(packCoord(successCoord));
            },
            onFailure:(failureCoord,errorCode) => {
                console.log(`Room ${room.name}: failed to construct first spawn at ${failureCoord.x},${failureCoord.y} 
                        with error code ${errorCode}`
                );
            }
        });
        
        return;
    }

    const spawnCoords=spawns.map(spawn => ({x:spawn.pos.x, y:spawn.pos.y}) as Coord);
    const baseCenter=findCenterCoord(spawnCoords);



    
    // --------------- Storage Construction ---------------//

    const roomStorage=room.storage

    if(!roomStorage && roomLevel >4) {
        const storageConntructionConfig=getStorageStructureConfig({
            room,
            spawns,
            roomTerrain,
            occupiedPackedCoordsSet,
        });
        if(storageConntructionConfig) {
        constructStructuresAtCoords({
            room,
            constructionCoords:storageConntructionConfig.coord,
            structureType:storageConntructionConfig.structureType,
            force:true,
            onSuccess:(successCoord) => {
                occupiedPackedCoordsSet.add(packCoord(successCoord));
            },
            onFailure:(failureCoord,errorCode) => {
                console.log(`Room ${room.name}: failed to construct storage at ${failureCoord.x},${failureCoord.y} 
                        with error code ${errorCode}`
                );
            }
        });
        }
    }



    // --------------- Extensions Construction ---------------//
    const existingExtensions=roomStructures.filter(st => st.structureType === STRUCTURE_EXTENSION)
    const constructingExtensions=roomConstructionsSites.filter(cs => cs.structureType === STRUCTURE_EXTENSION)

    const totalExtensionsCount=existingExtensions.length+constructingExtensions.length;
    const maxExtensionsCount=getMaxBuildableStructuresByLevel(STRUCTURE_EXTENSION, roomLevel);

    if(totalExtensionsCount < maxExtensionsCount) {
        const extensionsNeededCount=maxExtensionsCount-totalExtensionsCount;
        console.log(`need to construct ${extensionsNeededCount} extensions in room ${room.name}`);


        const extensionsConstructionCoords=getExtensionsConstructionsCoords({
            baseCenter,
            occupiedPackedCoordsSet,
            roomTerrain,
            extensionsNeededCount,
        });

        constructStructuresAtCoords({
            room,
            constructionCoords:extensionsConstructionCoords,
            structureType:STRUCTURE_EXTENSION,
            onSuccess:(successCoord) => {
                occupiedPackedCoordsSet.add(packCoord(successCoord));
            }
        });

        

    }


    // --------------- Towers Construction ---------------//
    const existingTowers=roomStructures.filter(st => st.structureType === STRUCTURE_TOWER);
    const constructingTowers=roomConstructionsSites.filter(cs => cs.structureType === STRUCTURE_TOWER);

    const totalTowersCount=existingTowers.length+constructingTowers.length;
    const maxTowersCount=getMaxBuildableStructuresByLevel(STRUCTURE_TOWER, roomLevel);
    
    if(totalTowersCount < maxTowersCount ) {
        const towersNeededCount=maxTowersCount-totalTowersCount;


        const assumedTowerSites=[...existingTowers,...constructingTowers];
        const assumedTowersCoords=assumedTowerSites.map(tower => ({x:tower.pos.x, y:tower.pos.y}) as Coord);

        const towersConstructionCoords=getTowerConstructionsCoords({
            baseCenter,
            occupiedPackedCoordsSet,
            roomTerrain,
            existingTowerCoords:assumedTowersCoords,
            towersNeededCount,
        });

        constructStructuresAtCoords({
            room,
            constructionCoords:towersConstructionCoords,
            structureType:STRUCTURE_TOWER,
            onSuccess:(successCoord) => {
                occupiedPackedCoordsSet.add(packCoord(successCoord));
            }
        });

    }



    return;

    // --------------- Mining Storage Construction ---------------//

    const miningStorageStructureConfigs=getMiningStorageStructureConfigs({
        room,
        baseCenter,
        roomTerrain,
        occupiedPackedCoordsSet,
    });

    if(miningStorageStructureConfigs.length > 0) {

        miningStorageStructureConfigs.forEach(constructionConfig => {

            const {coord, structureType}=constructionConfig;

            const alreadyConstructed=existingStructures.some(st => st.pos.x === coord.x && st.pos.y === coord.y && st.structureType === structureType);
            if(alreadyConstructed) {
                return;
            }

            const isBeingConstructed=roomConstructionsSites.some(cs => cs.pos.x === coord.x && cs.pos.y === coord.y && cs.structureType === structureType);
            if(isBeingConstructed) {
                return;
            }

            constructStructuresAtCoords({
                room,
                constructionCoords:coord,
                structureType,
                onSuccess:(successCoord) => {
                    occupiedPackedCoordsSet.add(packCoord(successCoord));
                },
                onFailure:(failureCoord,errorCode) => {
                    console.log(`Room ${room.name}: failed to construct mining storage at ${failureCoord.x},${failureCoord.y} 
                        with error code ${errorCode}`
                    );
                }
            });
        });
    }
    
}







