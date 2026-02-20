


export const updateFatigueHeatMap = (room:Room,position:RoomPosition,amount:number=1) => {
    const coordinateString = `${position.x},${position.y}`;

    if(room.memory.fatigueHeatMap) {
        const prevValue = room.memory.fatigueHeatMap[coordinateString] || 0;
        const newValue = prevValue + amount;
        room.memory.fatigueHeatMap[coordinateString] = newValue;
    }
}

export const getFatigueHeatMap = (room:Room) => {
    return room.memory.fatigueHeatMap;
}

export const clearFatigueHeatMap = (room:Room) => {
    room.memory.fatigueHeatMap = {};
}