
import { MAX_EXTENSIONS_BY_LEVEL, MAX_TOWERS_BY_LEVEL } from "../gameConstanst";
import { getBestTowerConstructionPosition } from "./towers";


import { findCenter } from "../grid/utils";


export const constructStructuresInRoom = (room: Room) => {

    const roomLevel = room.controller?.level || 0;
    const roomStructures = room.find(FIND_STRUCTURES);
    const roomConstructionsSites=room.find(FIND_CONSTRUCTION_SITES);
    const occupiedPositions=[...roomStructures,...roomConstructionsSites].map(st => st.pos);

    const spawns=roomStructures.filter(st => st.structureType === STRUCTURE_SPAWN);

    const existingExtensions=roomStructures.filter(st => st.structureType === STRUCTURE_EXTENSION)
    const constructingExtensions=roomConstructionsSites.filter(cs => cs.structureType === STRUCTURE_EXTENSION)

    const totalExtensionsCount=existingExtensions.length+constructingExtensions.length;
    const maxExtensionsCount=MAX_EXTENSIONS_BY_LEVEL[roomLevel];

    if(totalExtensionsCount < maxExtensionsCount) {
        console.log('need to construct extensions in room', room.name);
    }


    const existingTowers=roomStructures.filter(st => st.structureType === STRUCTURE_TOWER);
    const constructingTowers=roomConstructionsSites.filter(cs => cs.structureType === STRUCTURE_TOWER);

    const totalTowersCount=existingTowers.length+constructingTowers.length;
    const maxTowersCount=MAX_TOWERS_BY_LEVEL[roomLevel];
    
    if(totalTowersCount < maxTowersCount && false) {
        const baseCenter = findCenter(spawns.map(spawn => spawn.pos));
        const newTowersNeededCount=maxTowersCount-totalTowersCount;


        for(let i=0; i<newTowersNeededCount; i++) {
            const newTowerConstPos=getBestTowerConstructionPosition({
                room,
                baseCenter,
                existingTowerPositions:existingTowers.map(tower => tower.pos),
                excludePositions:occupiedPositions
            });
            if(!newTowerConstPos) {
                console.log(`Room ${room.name}: no valid tower construction position found`);
                break;
            }
            const constructionResult=room.createConstructionSite(newTowerConstPos, STRUCTURE_TOWER);
            if(constructionResult ==OK) {
                occupiedPositions.push(newTowerConstPos);
            }
            if(constructionResult !== OK) {
                console.log(`Room ${room.name}: failed to construct tower at ${newTowerConstPos.toString()}`);
                console.log('constructionResult', constructionResult);
                break;
            }
            room.createConstructionSite(newTowerConstPos, STRUCTURE_TOWER);
        }


            
    }
}







