export type Coord = `${number},${number}`;

export function parseCoord(c: Coord): {x: number, y: number} {
    const [x, y] = c.split(",").map(Number);
    return {x, y};
}

export type HeatMap= Record<Coord,number>;



