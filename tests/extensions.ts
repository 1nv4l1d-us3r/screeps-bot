import { isPositionReachable } from "../src/roomDesign/constructStructures";
import { spiralPositionsGenerator } from "../src/grid/utils";
import { getMaxExtensionsByLevel } from "../src/gameConstants";

export const testExtensionsConstruction = () => {

    const room=Game.rooms['E28S12'];
    if(!room) {
        console.log('Room E28S12 not found');
        return;
    }
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

    const existingExtensions=roomStructures.filter(st => st.structureType === STRUCTURE_EXTENSION)
    const constructingExtensions=roomConstructionsSites.filter(cs => cs.structureType === STRUCTURE_EXTENSION)

    const totalExtensionsCount=0
    const maxExtensionsCount=getMaxExtensionsByLevel(roomLevel);

    if(totalExtensionsCount < maxExtensionsCount) {
        const extensionsNeededCount=maxExtensionsCount-totalExtensionsCount;
        console.log(`need to construct ${extensionsNeededCount} extensions in room ${room.name}`);
        const spawn=spawns[0];
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
            if(inValidBuildPositions.has(pos.toString())) {
                return false;
            }
            if(roomTerrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
                inValidBuildPositions.add(pos.toString());
                return false;
            }
            if(!isPositionReachable(pos, inValidBuildPositions)) {
                inValidBuildPositions.add(pos.toString());
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
            pos.createFlag(undefined,COLOR_YELLOW)
        });
    }
}
