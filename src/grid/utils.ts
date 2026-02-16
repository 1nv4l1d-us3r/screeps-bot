const MIN_GRID_INDEX = 0;
const MAX_GRID_INDEX = 49;

export const findCenter = (positions: RoomPosition[]) => {
    const firstPosition = positions[0];
    if(positions.length === 1) {
        return firstPosition;
    }
    const centerX = positions.reduce((acc, pos) => acc + pos.x, 0) / positions.length;
    const centerY = positions.reduce((acc, pos) => acc + pos.y, 0) / positions.length;
    return new RoomPosition(centerX, centerY, firstPosition.roomName);

}

export const getFullGridPositions = (room: Room) => {
    const grid: RoomPosition[] = [];
    for(let x = MIN_GRID_INDEX; x <= MAX_GRID_INDEX; x++) {
        for(let y = MIN_GRID_INDEX; y <= MAX_GRID_INDEX; y++) {
            grid.push(new RoomPosition(x, y, room.name));
        }
    }
    return grid;
}

export const getGridAroundPosition = (position: RoomPosition, size: number) => {
    const grid: RoomPosition[] = [];
    const topLeft = {x:position.x - size, y:position.y - size};
    const bottomRight = {x:position.x + size, y:position.y + size};

    for(let x = topLeft.x; x <= bottomRight.x; x++) {
        for(let y = topLeft.y; y <= bottomRight.y; y++) {

            if(x===position.x && y===position.y) {
                continue;
            }

            if(  x>=MIN_GRID_INDEX 
                && x<=MAX_GRID_INDEX
                && y>=MIN_GRID_INDEX
                && y<=MAX_GRID_INDEX
            ) {
                const cell = new RoomPosition(x, y, position.roomName);
                grid.push(cell);
            }
        }
    }
    return grid;
}

const isValidGridPosition = (x: number, y: number) => {
    return x>=MIN_GRID_INDEX 
        && x<=MAX_GRID_INDEX 
        && y>=MIN_GRID_INDEX 
        && y<=MAX_GRID_INDEX;
}

const createPositionIfValid = (x: number, y: number, roomName: string) => {
    if(isValidGridPosition(x, y)) {
        return new RoomPosition(x, y, roomName);
    }
    return undefined;
}

export const getAdjacentPositions = (position: RoomPosition) => {

    const topLeft = createPositionIfValid(position.x - 1, position.y - 1, position.roomName);
    const top = createPositionIfValid(position.x, position.y - 1, position.roomName);
    const topRight = createPositionIfValid(position.x + 1, position.y - 1, position.roomName);

    const left = createPositionIfValid(position.x - 1, position.y, position.roomName);
    const right = createPositionIfValid(position.x + 1, position.y, position.roomName);

    const bottomLeft = createPositionIfValid(position.x - 1, position.y + 1, position.roomName);
    const bottom = createPositionIfValid(position.x, position.y + 1, position.roomName);
    const bottomRight = createPositionIfValid(position.x + 1, position.y + 1, position.roomName);

    const adjacentPositions = [topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight]

    const filtered= adjacentPositions.filter(pos => pos !== undefined);
    return filtered;

}