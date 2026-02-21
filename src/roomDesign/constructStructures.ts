import { getMaxExtensionsByLevel, getMaxTowersByLevel } from "../gameConstants";


import { getExtensionsConstructionPositions } from "./extensions";
import { getTowerConstructionPositions } from "./towers";
import { findCenter } from "../grid/utils";
import { getFirstSpawnConstructionPosition } from "./spawn";



export const constructStructuresInRoom = (room: Room) => {

    const roomLevel = room.controller?.level || 0;
    const roomTerrain = room.getTerrain();
    
    const roomStructures = room.find(FIND_STRUCTURES);
    const roomConstructionsSites=room.find(FIND_CONSTRUCTION_SITES);
    
    const occupiedPositions = [
        ...roomStructures,
        ...roomConstructionsSites
    ].map(st => st.pos);


    const inValidBuildPositions = new Set<string>()

    occupiedPositions.forEach(pos => {
        inValidBuildPositions.add(pos.toString());
    });

    const spawns=roomStructures.filter(st => st.structureType === STRUCTURE_SPAWN);

    if(spawns.length === 0) {
        const firstSpawnConstructionPosition=getFirstSpawnConstructionPosition({
            room,
            roomTerrain,
            inValidBuildPositions,
        });
        if(!firstSpawnConstructionPosition) {
            console.log(`Room ${room.name}: no first spawn construction position found`);
            return;
        }
        const constructionResult=room.createConstructionSite(firstSpawnConstructionPosition, STRUCTURE_SPAWN);
        if(constructionResult === OK) {
            return;
        }
        console.log(`Room ${room.name}: failed to construct first spawn at ${firstSpawnConstructionPosition.toString()}`);
        return;
    }
    const baseCenter=findCenter(spawns.map(spawn => spawn.pos));



    const existingExtensions=roomStructures.filter(st => st.structureType === STRUCTURE_EXTENSION)
    const constructingExtensions=roomConstructionsSites.filter(cs => cs.structureType === STRUCTURE_EXTENSION)

    const totalExtensionsCount=existingExtensions.length+constructingExtensions.length;
    const maxExtensionsCount=getMaxExtensionsByLevel(roomLevel);

    if(totalExtensionsCount < maxExtensionsCount) {
        const extensionsNeededCount=maxExtensionsCount-totalExtensionsCount;
        console.log(`need to construct ${extensionsNeededCount} extensions in room ${room.name}`);


        const extensionsConstructionPositions=getExtensionsConstructionPositions({
            baseCenter,
            inValidBuildPositions,
            roomTerrain,
            extensionsNeededCount,
        });

        extensionsConstructionPositions.forEach(pos => {
            const constructionResult=room.createConstructionSite(pos, STRUCTURE_EXTENSION);
            if(constructionResult === OK) {
                occupiedPositions.push(pos);
            }
        });

        

    }


    const existingTowers=roomStructures.filter(st => st.structureType === STRUCTURE_TOWER);
    const constructingTowers=roomConstructionsSites.filter(cs => cs.structureType === STRUCTURE_TOWER);

    const totalTowersCount=existingTowers.length+constructingTowers.length;
    const maxTowersCount=getMaxTowersByLevel(roomLevel);
    
    if(totalTowersCount < maxTowersCount ) {
        const towersNeededCount=maxTowersCount-totalTowersCount;


        const existingTowerPositions=[...existingTowers,...constructingTowers].map(tower => tower.pos);

        const towersConstructionPositions=getTowerConstructionPositions({
            baseCenter,
            inValidBuildPositions,
            roomTerrain,
            existingTowerPositions,
            towersNeededCount,
        });

        towersConstructionPositions.forEach(pos => {
            const constructionResult=room.createConstructionSite(pos, STRUCTURE_TOWER);
            if(constructionResult === OK) {
                occupiedPositions.push(pos);
            }
        });

    }
}







