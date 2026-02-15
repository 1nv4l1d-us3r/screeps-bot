const MIN_GRID_INDEX = 0;
const MAX_GRID_INDEX = 49;

export const getGridAroundPosition = (position: RoomPosition, size: number) => {
    const grid: RoomPosition[] = [];
    const topLeft = new RoomPosition(position.x - size, position.y - size, position.roomName);
    const bottomRight = new RoomPosition(position.x + size, position.y + size, position.roomName);

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

export const getAdjacentPositions = (position: RoomPosition) => {

    const topLeft = new RoomPosition(position.x - 1, position.y - 1, position.roomName);
    const top = new RoomPosition(position.x, position.y - 1, position.roomName);
    const topRight = new RoomPosition(position.x + 1, position.y - 1, position.roomName);

    const left = new RoomPosition(position.x - 1, position.y, position.roomName);
    const right = new RoomPosition(position.x + 1, position.y, position.roomName);

    const bottomLeft = new RoomPosition(position.x - 1, position.y + 1, position.roomName);
    const bottom = new RoomPosition(position.x, position.y + 1, position.roomName);
    const bottomRight = new RoomPosition(position.x + 1, position.y + 1, position.roomName);

    const adjacentPositions = [topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight]

    const filtered= adjacentPositions.filter(pos => {
        return pos.x>=MIN_GRID_INDEX 
            && pos.x<=MAX_GRID_INDEX 
            && pos.y>=MIN_GRID_INDEX 
            && pos.y<=MAX_GRID_INDEX;
    });
    return filtered;

}