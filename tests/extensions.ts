import { findCenterCoord, isCoordReachable, packCoord, spiralCoordsGenerator } from "../src/geometry";
import { getMaxBuildableStructuresByLevel } from "../src/gameConstants";
import { Coord, PackedCoord } from "../src/types/geometry";
import { CpuProfiler } from "../src/helpers/cpuProfiler";
export const testExtensionsConstruction = () => {

    const room=Game.rooms['E28S12'];
    if(!room) {
        console.log('Room E28S12 not found');
        return;
    }
    const roomLevel = room.controller?.level || 0;
    const roomTerrain = room.getTerrain();
    

    CpuProfiler.log("finding structures and construction sites");
    const roomStructures = room.find(FIND_STRUCTURES);
    const roomConstructionsSites=room.find(FIND_CONSTRUCTION_SITES);
    CpuProfiler.logEnd("finding structures and construction sites");

    const existingStructures=[...roomStructures, ...roomConstructionsSites];
    
    const occupiedPackedCoordsSet = new Set<PackedCoord>()
    existingStructures.forEach(st => {
        occupiedPackedCoordsSet.add(packCoord({x:st.pos.x, y:st.pos.y}));
    });



    CpuProfiler.log("filtering structures and construction sites");
    const spawns=roomStructures.filter(st => st.structureType === STRUCTURE_SPAWN);

    const existingExtensions=roomStructures.filter(st => st.structureType === STRUCTURE_EXTENSION)
    const constructingExtensions=roomConstructionsSites.filter(cs => cs.structureType === STRUCTURE_EXTENSION)
    CpuProfiler.logEnd("filtering structures and construction sites");

    const totalExtensionsCount=0
    const maxExtensionsCount=getMaxBuildableStructuresByLevel(STRUCTURE_EXTENSION, roomLevel);

    const baseCenter=findCenterCoord(spawns.map(spawn => ({x:spawn.pos.x, y:spawn.pos.y}) as Coord));

    if(totalExtensionsCount < maxExtensionsCount) {
        const extensionsNeededCount=maxExtensionsCount-totalExtensionsCount;
        console.log(`need to construct ${extensionsNeededCount} extensions in room ${room.name}`);
        const spawn=spawns[0];
        if(!spawn) {
            console.log(`Room ${room.name}: no spawn found, skipping extension construction`);
            return;
        }


        const foundCoords:Coord[] = [];
        const yieldFunction = (coord: Coord, index: number) => {
            if(index%2!==0) {
                return false;
            }
            if(roomTerrain.get(coord.x, coord.y) === TERRAIN_MASK_WALL) {
                occupiedPackedCoordsSet.add(packCoord(coord));
                return false;
            }
            if(occupiedPackedCoordsSet.has(packCoord(coord))) {
                return false;
            }
            if(!isCoordReachable({coord, occupiedPackedCoordsSet})) {
                occupiedPackedCoordsSet.add(packCoord(coord));
                return false;
            }
            foundCoords.push(coord);
            return foundCoords.length>=extensionsNeededCount;
        }
        CpuProfiler.log("running spiral cords generator");
        spiralCoordsGenerator({
            center:baseCenter,
            yieldFunction,
        });
        CpuProfiler.logEnd("running spiral cords generator");

        console.log(`found ${foundCoords.length} extension construction positions in room ${room.name}`);

        CpuProfiler.log("visualizing extension positions");
        const visual=room.visual;
        foundCoords.forEach(coord => {
            visual.circle(coord.x, coord.y,{fill:'yellow', radius:0.5});
        });
        CpuProfiler.logEnd("visualizing extension positions");
    }
}

