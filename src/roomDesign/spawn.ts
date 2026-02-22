import { 
    createCoordIfValid, 
    findCenterCoord,
    isCoordReachable,
    packCoord,
    spiralCordsGenerator
 } from "../geometry";
import { Coord, PackedCoord } from "../types/geometry";

interface GetFirstSpawnConstructionCoordParams {
    room: Room;
    roomTerrain: RoomTerrain;
    occupiedPackedCoordsSet: Set<PackedCoord>;
}
export const getFirstSpawnConstructionCoord = (params: GetFirstSpawnConstructionCoordParams) => {

    const {room, roomTerrain, occupiedPackedCoordsSet} = params;

    const controller=room.controller;
    if(!controller) {
        return;
    }
    
    const sources=room.find(FIND_SOURCES);

    const criticalStructures=[...sources,controller];
    const criticalStructuresCoords=criticalStructures.map(st => ({x:st.pos.x, y:st.pos.y}) as Coord);

    const center=findCenterCoord(criticalStructuresCoords);


    let foundCoord:Coord|undefined;

    const yieldFunction = (coord: Coord) => {
     
        if(occupiedPackedCoordsSet.has(packCoord(coord))) {
            return false;
        }
        if(roomTerrain.get(coord.x, coord.y) === TERRAIN_MASK_WALL) {
            occupiedPackedCoordsSet.add(packCoord(coord));
            return false;
        }
        if(!isCoordReachable({ coord, occupiedPackedCoordsSet })) {
            occupiedPackedCoordsSet.add(packCoord(coord));
            return false;
        }
        foundCoord=coord;
        return true;
    }

    spiralCordsGenerator({
        center,
        yieldFunction,
    });
    return foundCoord;
}