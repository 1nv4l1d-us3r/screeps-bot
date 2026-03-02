import { Certificate } from "node:crypto";
import { ROOM_SIZE } from "../gameConstants";
import type { Coord, PackedCoord } from "../types/geometry";
import { packCoord } from "./packedCords";


export const isValidCoordAxis = (x: number) => {
    return x >= 0 && x < ROOM_SIZE;
}

export const isValidCoord = (coord: Coord) => {
    return isValidCoordAxis(coord.x) && isValidCoordAxis(coord.y);
}

export const createCoordIfValid = (x: number, y: number) => {
    if(isValidCoordAxis(x) && isValidCoordAxis(y)) {
        return { x, y } as Coord;
    }
    return undefined;
}

export const getCoordDistance = (a: Coord, b: Coord) => {
    const deltaX = Math.abs(a.x - b.x);
    const deltaY = Math.abs(a.y - b.y);
    const distance = Math.max(deltaX, deltaY);
    return distance;
}



export const findCenterCoord=(targets: Coord[]):Coord => {

    const centerX = targets.reduce((acc, target) => acc + target.x, 0) / targets.length;
    const centerY = targets.reduce((acc, target) => acc + target.y, 0) / targets.length;
    return { x: centerX, y: centerY };
}


export const getAdjacentCoords = (center: Coord) => {

    const topLeft = createCoordIfValid(center.x - 1, center.y - 1);
    const top = createCoordIfValid(center.x, center.y - 1);
    const topRight = createCoordIfValid(center.x + 1, center.y - 1);

    const left = createCoordIfValid(center.x - 1, center.y);
    const right = createCoordIfValid(center.x + 1, center.y);
    
    const bottomLeft = createCoordIfValid(center.x - 1, center.y + 1);
    const bottom = createCoordIfValid(center.x, center.y + 1);
    const bottomRight = createCoordIfValid(center.x + 1, center.y + 1);

    const adjacentCoords = [topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight];
    const validAdjacentCoords = adjacentCoords.filter(coord => coord !== undefined);
    return validAdjacentCoords;

}



interface GetCoordsInRangeParams {
    center: Coord;
    range: number;
    includeCenter?: boolean;
}

export const getCoordsInRange=(params: GetCoordsInRangeParams):Coord[] => {
    const { center, range, includeCenter = false } = params;

    const topLeft:Coord = { x: Math.max(0, center.x - range), y: Math.max(0, center.y - range) };
    const bottomRight:Coord = { x: Math.min(ROOM_SIZE - 1, center.x + range), y: Math.min(ROOM_SIZE - 1, center.y + range) };
    const coords:Coord[] = [];
    for(let x = topLeft.x; x <= bottomRight.x; x++) {
        for(let y = topLeft.y; y <= bottomRight.y; y++) {
           
            const coord:Coord = { x, y };
            coords.push(coord);
        }
    }
    if(!includeCenter) {
        const filteredCoords = coords.filter(coord => !(coord.x === center.x && coord.y === center.y));
        return filteredCoords;
    }
    return coords;
}



interface IsCoordReachableParams {
    coord: Coord;
    occupiedPackedCoordsSet: Set<PackedCoord>;
}

export const isCoordReachable = (params: IsCoordReachableParams) => {
    const { coord, occupiedPackedCoordsSet } = params;
    const adjacentCoords = getAdjacentCoords(coord);

    return adjacentCoords.some(adjacentCoord => {
        return !occupiedPackedCoordsSet.has(packCoord(adjacentCoord))
    });
}





//------------ Distance functions ------------//

interface FindMaxDistanceCoordParams {
    center: Coord;
    targets: Coord[];
}
interface FindMaxDistanceCoordResult {
    maxDistance: number;
    maxDistanceCoord: Coord;
}

export const findMaxDistanceCoord=(params: FindMaxDistanceCoordParams):FindMaxDistanceCoordResult => {
    const { center, targets } = params;
    const firstTarget = targets[0];
    let maxDistance = getCoordDistance(center, firstTarget);
    let maxDistanceCoord:Coord = firstTarget;
    for(let i = 1; i < targets.length; i++) {
        const target = targets[i];
        const distance = getCoordDistance(center, target);
        if(distance > maxDistance) {
            maxDistance = distance;
            maxDistanceCoord = target;
        }
    }
    return { maxDistance, maxDistanceCoord };
}

interface FindMinDistanceCoordParams {
    center: Coord;
    targets: Coord[];
}
interface FindMinDistanceCoordResult {
    minDistance: number;
    minDistanceCoord: Coord;
}

export const findMinDistanceCoord=(params: FindMinDistanceCoordParams):FindMinDistanceCoordResult => {
    const { center, targets } = params;
    const firstTarget = targets[0];
    let minDistance = getCoordDistance(center, firstTarget);
    let minDistanceCoord = firstTarget;
    for(let i = 1; i < targets.length; i++) {
        const target = targets[i];
        const distance = getCoordDistance(center, target);
        if(distance < minDistance) {
            minDistance = distance;
            minDistanceCoord = target;
        }
    }
    return { minDistance, minDistanceCoord };
}



export const getRingCoords = (center: Coord, radius: number) => {
    
    const topLeft:Coord= { x: center.x - radius, y: center.y - radius };
    const topRight:Coord= { x: center.x + radius, y: center.y - radius };
    const bottomLeft:Coord= { x: center.x - radius, y: center.y + radius };
    const bottomRight:Coord= { x: center.x + radius, y: center.y + radius };

    const ringCoords:Coord[] = []

    let x=topLeft.x;
    let y=topLeft.y;

    const moveRight = () => {
        x++;
    }
    const moveDown = () => {
        y++;
    }
    const moveLeft = () => {
        x--;
    }
    const moveUp = () => {
        y--;
    }

    const addCoordIfValid = (x:number, y:number) => {
        const coord=createCoordIfValid(x, y);
        if(coord) {
            ringCoords.push(coord);
        }
    }

    // move right
    while(x < topRight.x) {
        addCoordIfValid(x, y);
        moveRight();
        
    }

    // move down
    while(y < bottomRight.y) {
        addCoordIfValid(x, y);
        moveDown();
    }

    // move left
    while(x > bottomLeft.x) {
        addCoordIfValid(x, y);
        moveLeft();
    }

    // move up
    while(y > topLeft.y) {
        addCoordIfValid(x, y);
        moveUp();
    }

    return ringCoords;
}





interface GetReachableNeighborsParams {
    center: Coord;
    roomTerrain?: RoomTerrain;
    occupiedPackedCoordsSet?: Set<PackedCoord>;
}

/*
Returns all adjacent coords that are reachable from the center coord.
If roomTerrain is provided, it will only return adjacent coords that are walkable.
If occupiedPackedCoordsSet is provided, it will only return adjacent coords that are not occupied.
*/
export const getReachableNeighborCoords=(params: GetReachableNeighborsParams):Coord[] => {
    const { center, roomTerrain,occupiedPackedCoordsSet } = params;
    const adjacentCoords = getAdjacentCoords(center);

    let filterFunc: (coord: Coord) => boolean = () => true;

    if(occupiedPackedCoordsSet) {
        filterFunc = (coord: Coord) => {
            return !occupiedPackedCoordsSet.has(packCoord(coord));
        }
    }
    if(roomTerrain) {
        filterFunc = (coord: Coord) => {
            return roomTerrain.get(coord.x, coord.y) != TERRAIN_MASK_WALL;
        }
    }
    const reachableNeighborCoords = adjacentCoords.filter(coord => filterFunc(coord));
    return reachableNeighborCoords;
}




interface GetMaxReachableNeighborCoordsParams extends GetReachableNeighborsParams {
}

/*
Returns the adjacent coord with the most reachable neighbors.
If roomTerrain is provided, it will only return the adjacent coord with the most reachable neighbors that are walkable.
If occupiedPackedCoordsSet is provided, it will only return the adjacent coord with the most reachable neighbors that are not occupied.
*/
export const getMaxReachableNeighborCoords=(params: GetMaxReachableNeighborCoordsParams) => {
    const { center, roomTerrain,occupiedPackedCoordsSet } = params;
    const reachableAdjacentCoords = getReachableNeighborCoords({
        center,
        roomTerrain,
        occupiedPackedCoordsSet
    });
    if(!reachableAdjacentCoords.length) {
        return
    }
    let firstAdjacentCoord = reachableAdjacentCoords[0];
    let maxNeighboursCoord = firstAdjacentCoord;
    let maxNeighboursCount = getReachableNeighborCoords({
        center:firstAdjacentCoord,
        roomTerrain,
        occupiedPackedCoordsSet
    }).length;

    for(let i = 1; i < reachableAdjacentCoords.length; i++) {
        const adjacentCoord = reachableAdjacentCoords[i];
        const adJacentCoordNeighbours = getReachableNeighborCoords({
            center:adjacentCoord,
            roomTerrain,
            occupiedPackedCoordsSet
        })
        const adJacentCoordNeighboursCount = adJacentCoordNeighbours.length;
        if(adJacentCoordNeighboursCount > maxNeighboursCount) {
            maxNeighboursCoord = adjacentCoord;
            maxNeighboursCount = adJacentCoordNeighboursCount;
        }
    }
    return maxNeighboursCoord;
}




export const getTopCoord = (coord: Coord) => {
    return createCoordIfValid(coord.x, coord.y - 1);
}

export const getBottomCoord = (coord: Coord) => {
    return createCoordIfValid(coord.x, coord.y + 1);
}

export const getLeftCoord = (coord: Coord) => {
    return createCoordIfValid(coord.x - 1, coord.y);
}

export const getRightCoord = (coord: Coord) => {
    return createCoordIfValid(coord.x + 1, coord.y);
}

