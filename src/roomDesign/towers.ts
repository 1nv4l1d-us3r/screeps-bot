
import { 
    spiralCordsGenerator,
    isCoordReachable,
    packCoord,
    getCoordDistance,
    getMinDistanceCoord,
 } from "../geometry";
import { Coord, PackedCoord } from "../types/geometry";





interface GetBestTowerConstructionPositionParams {
    baseCenter: Coord;
    roomTerrain: RoomTerrain;
    occupiedPackedCoordsSet: Set<PackedCoord>;
    existingTowerCoords: Coord[];
    towersNeededCount: number;
}



export const getTowerConstructionsCoords = (params: GetBestTowerConstructionPositionParams) => {

    const {
        baseCenter,
        roomTerrain,
        occupiedPackedCoordsSet,
        existingTowerCoords,
        towersNeededCount,
    } = params;


    const minDistanceBetweenTowers = 10;


    const foundCoords:Coord[] = [];
    
    const yieldFunction = (coord: Coord, index: number) => {
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

        const { minDistance: closestExistingTowerDistance } = getMinDistanceCoord({ center: coord, targets: existingTowerCoords });
        if(closestExistingTowerDistance < minDistanceBetweenTowers) {
            return false;
        }
        if(!isCoordReachable({ coord, occupiedPackedCoordsSet })) {
            occupiedPackedCoordsSet.add(packCoord(coord));
            return false;
        }
        foundCoords.push(coord);
        return foundCoords.length>=towersNeededCount;
    }

    spiralCordsGenerator({
        center:baseCenter,
        yieldFunction,
        spiralStepSize:3, // sparse search
    });
    return foundCoords;
}
