import { getMaxBuildableStructuresByLevel } from "../gameConstants";


import { getExtensionsConstructionsCoords } from "./extensions";
import { getTowerConstructionsCoords } from "./towers";
import { findCenterCoord, packCoord } from "../geometry";
import { getFirstSpawnConstructionCoord } from "./spawn";
import { Coord, PackedCoord } from "../types/geometry";
import { constructStructuresAtCoords } from "./common";



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

    


    const spawns=roomStructures.filter(st => st.structureType === STRUCTURE_SPAWN);

    if(spawns.length === 0) {
        const firstSpawnCoord=getFirstSpawnConstructionCoord({
            room,
            roomTerrain,
            occupiedPackedCoordsSet,
        });
        if(!firstSpawnCoord) {
            console.log(`Room ${room.name}: no first spawn construction position found`);
            return;
        }

        let failure=false;
        constructStructuresAtCoords({
            room,
            constructionCoords:[firstSpawnCoord],
            structureType:STRUCTURE_SPAWN,
            onSuccess:(successCoord) => {
                occupiedPackedCoordsSet.add(packCoord(successCoord));
            },
            onFailure:(failureCoord) => {
                console.log(`Room ${room.name}: failed to construct first spawn at ${failureCoord.x},${failureCoord.y}`);
                failure=true;
            }
        });
        if(failure) {
            return;
        }
    }

    const spawnCoords=spawns.map(spawn => ({x:spawn.pos.x, y:spawn.pos.y}) as Coord);
    const baseCenter=findCenterCoord(spawnCoords);



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
}







