CONTROLLER_STRUCTURES
import { 
    spiralCoordsGenerator,
    isCoordReachable,
    packCoord,
    getCoordDistance,
    findMinDistanceCoord,
 } from "../../../geometry";
import { Coord, PackedCoord } from "../../../types/geometry";
import { StructureConstructionConfig } from "../../../types/room/design";





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

        const { minDistance: closestExistingTowerDistance } = findMinDistanceCoord({ center: coord, targets: existingTowerCoords });
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

    spiralCoordsGenerator({
        center:baseCenterCoord,
        yieldFunction,
        spiralStepSize:3, // sparse search
    });
    return foundCoords;
}
