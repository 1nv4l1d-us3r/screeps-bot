
import { MAX_EXTENSIONS_BY_LEVEL, MAX_TOWERS_BY_LEVEL } from "../gameConstanst";
import { getBestTowerConstructionPosition } from "./towers";

import { spiralPositionsGenerator, findCenter} from "../grid/utils";



export const constructStructuresInRoom = (room: Room) => {

    const roomTerrain = room.getTerrain();
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
        const extensionsNeededCount=maxExtensionsCount-totalExtensionsCount;
        console.log(`need to construct ${extensionsNeededCount} extensions in room ${room.name}`);
        const spawn=spawns.at(0);
        if(!spawn) {
            console.log(`Room ${room.name}: no spawn found, skipping extension construction`);
            return;
        }


        const positionsFound:RoomPosition[] = [];
        let yieldIndex=0;
        const yieldFunction = (pos: RoomPosition) => {
            yieldIndex++;
            if(yieldIndex%2!==0) {
                return false;
            }
            if(roomTerrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
                return false;
            }
            if(occupiedPositions.some(occupiedPos => occupiedPos.isEqualTo(pos))) {
                return false;
            }
            positionsFound.push(pos);
            return positionsFound.length>=extensionsNeededCount;
        }
        spiralPositionsGenerator({
            center:spawns[0].pos,
            yieldFunction,
        });

        console.log(`found ${positionsFound.length} extension construction positions in room ${room.name}`);

        positionsFound.forEach(pos => {
            const constructionResult=room.createConstructionSite(pos, STRUCTURE_EXTENSION);
            if(constructionResult === OK) {
                occupiedPositions.push(pos);
            }
            else {
                console.log(`Room ${room.name}: failed to construct extension at ${pos.toString()}`);
                console.log('constructionResult', constructionResult);
            }
        });
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







