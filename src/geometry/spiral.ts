import { ROOM_SIZE } from "../utils/gameConstants";
import type { Coord, PackedCoord } from "../types/geometry";
import { createCoordIfValid, findMaxDistanceCoord, getCoordDistance, isCoordReachable } from "./coords";
import { packCoord } from "./packedCords";

interface SpiralCoordsGeneratorParams {
    center: Coord;   // the center of the spiral
    spiralStepSize?: number;
    cellStepSize?: number;
    yieldFunction: (coord: Coord,index: number) => boolean;
}

export const spiralCoordsGenerator = (params: SpiralCoordsGeneratorParams) => {
    const {
        center,
        spiralStepSize=1,
        cellStepSize=1,
        yieldFunction,
    } = params;

    const roomTopLeft:Coord = { x: 0, y: 0 };
    const roomTopRight:Coord = { x: ROOM_SIZE - 1, y: 0 };
    const roomBottomLeft:Coord = { x: 0, y: ROOM_SIZE - 1 };
    const roomBottomRight:Coord = { x: ROOM_SIZE - 1, y: ROOM_SIZE - 1 };

    const roomCorners=[roomTopLeft, roomTopRight, roomBottomLeft, roomBottomRight];

    const { maxDistance } = findMaxDistanceCoord({ center, targets: roomCorners });

    let x = center.x;
    let y = center.y;
    let index = 0;   // tracks the number of positions yielded until now

    let step = 1;
    let stopSignal = false;

    const yieldIfValidPosition = (x: number, y: number) => {
        const coord = createCoordIfValid(x, y);
        if(coord) {
            index++;
            const shouldStop = yieldFunction(coord, index);
            if(shouldStop) stopSignal = true;
        }
        else{
            const invalidCoord:Coord = { x, y };
            const distanceFromCenter = getCoordDistance(center, invalidCoord);
            // do not search beyond the room corners
            if(distanceFromCenter > maxDistance) {
                stopSignal = true;
            }
        }
    }

    while (!stopSignal) {
        // right
        for (let i = 0; i < step && !stopSignal; i++) {
            x += cellStepSize;
            yieldIfValidPosition(x, y);
        }
        // down
        for (let i = 0; i < step && !stopSignal; i++) {
            y += cellStepSize;
            yieldIfValidPosition(x, y);
        }
        step += spiralStepSize;
        // left
        for (let i = 0; i < step && !stopSignal; i++) {
            x -= cellStepSize;
            yieldIfValidPosition(x, y);
            if (stopSignal) return;
        }
        // up
        for (let i = 0; i < step && !stopSignal; i++) {
            y -= cellStepSize;
            yieldIfValidPosition(x, y);
        }
        step += spiralStepSize;
    }
}




interface GetAlternateSpiralCoordsParams {
    center: Coord;
    neededCount: number;
    roomTerrain: RoomTerrain;
    occupiedPackedCoordsSet: Set<PackedCoord>;
}

export const getAlternateSpiralCoords = (params: GetAlternateSpiralCoordsParams) => {


    const { center, neededCount, roomTerrain, occupiedPackedCoordsSet } = params;


    const alternateGridCoords:Coord[] = [];

    const yieldFunction = (coord: Coord, index: number) => {
        if(index%2!==0) {
            return false;
        }
        if(occupiedPackedCoordsSet.has(packCoord(coord))) {
            return false;
        }
        if(roomTerrain.get(coord.x, coord.y) === TERRAIN_MASK_WALL) {
            return false;
        }
        if(!isCoordReachable({ coord, occupiedPackedCoordsSet })) {
            return false;
        }
        alternateGridCoords.push(coord);
        return alternateGridCoords.length>=neededCount;
    }

    spiralCoordsGenerator({
        center,
        yieldFunction,
    });
    return alternateGridCoords;
}