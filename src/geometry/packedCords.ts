import { ROOM_SIZE } from "../utils/gameConstants";
import type { Coord, PackedCoord } from "../types/geometry";






export const packCoord = (coord: Coord) => {
    return coord.x * ROOM_SIZE + coord.y;
}

export const unpackCoord = (packedCoord: PackedCoord) => {
    const coord: Coord = {
        x: Math.floor(packedCoord / ROOM_SIZE),
        y: packedCoord % ROOM_SIZE,
    };
    return coord;
}



