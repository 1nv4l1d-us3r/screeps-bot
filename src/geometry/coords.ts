import { ROOM_SIZE } from "../gameConstants";
import type { Coord } from "../types/geometry";


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