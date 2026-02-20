import { getRoomPopulation } from "../src/spawning/RoomPopulation";

import { handleWorkerSpawning } from "../src/spawning/RoomSpawning";

export const testRoomPopulation = () => {
    const room = Game.rooms['E28S12'];
    const roomPopulation = getRoomPopulation(room);
    console.log(JSON.stringify(roomPopulation, null, 2));
    Memory.testData = roomPopulation;
}


export const testWorkerSpawning = () => {
    handleWorkerSpawning();
}

