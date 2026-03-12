CONTROLLER_STRUCTURES
import { 
    spiralCoordsGenerator,
    isCoordReachable,
    packCoord,
    getCoordDistance,
    findMinDistanceCoord,
 } from "../../../geometry";
import { Coord, PackedCoord } from "../../../types/geometry";





interface GetTowerConstructionCoordsParams {
    baseCenterCoord: Coord;
    roomTerrain: RoomTerrain;
    occupiedPackedCoordsSet: Set<PackedCoord>;
    existingTowerCoords: Coord[];
    towersNeededCount: number;
}



export const getTowerConstructionCoords = (params: GetTowerConstructionCoordsParams): Coord[] => {

    const {
        baseCenterCoord,
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

        let closestExistingTowerDistance=Infinity;

        if(existingTowerCoords.length) {
            const { minDistance } = findMinDistanceCoord({ center: coord, targets: existingTowerCoords });
            closestExistingTowerDistance = minDistance;

        }

        if(closestExistingTowerDistance < minDistanceBetweenTowers) {
            return false;
        }
        if(!isCoordReachable({ coord, occupiedPackedCoordsSet })) {
            occupiedPackedCoordsSet.add(packCoord(coord));
            return false;
        }
        foundCoords.push(coord);
        existingTowerCoords.push(coord);
        return foundCoords.length>=towersNeededCount;
    }

    spiralCoordsGenerator({
        center:baseCenterCoord,
        yieldFunction,
        spiralStepSize:3, // sparse search
    });
    return foundCoords;
}
