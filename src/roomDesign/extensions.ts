
import { 
    packCoord, 
    spiralCordsGenerator, 
    isCoordReachable 
} from "../geometry";

import { Coord, PackedCoord } from "../types/geometry";



interface GetExtensionsConstructionsCoordsParams {
    baseCenter: Coord;
    occupiedPackedCoordsSet: Set<PackedCoord>;
    roomTerrain: RoomTerrain;
    extensionsNeededCount: number;
}

export const getExtensionsConstructionsCoords= (params: GetExtensionsConstructionsCoordsParams) => {
    const { 
        baseCenter, 
        occupiedPackedCoordsSet,
        roomTerrain, 
        extensionsNeededCount
    } = params;


    const foundCoords:Coord[] = [];

    const yieldFunction = (coord: Coord,index: number) => {
        if(index%2!==0) {
            return false;
        }
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
        foundCoords.push(coord);
        return foundCoords.length>=extensionsNeededCount;
    }
    spiralCordsGenerator({
        center: baseCenter,
        yieldFunction,
    });
    return foundCoords;
}