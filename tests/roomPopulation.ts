import { getRoomPopulation,updateWorkerPopulation } from "../src/spawning/RoomPopulation";

import { handleRoomWorkerSpawning } from "../src/spawning/RoomSpawning";

export const testPopulationUpdate = () => {
    const myRooms=Object.values(Game.rooms).filter(room => room.controller?.my);
   updateWorkerPopulation(myRooms);
}


export const testSpawnOrder = () => {
    
    const myRooms=Object.values(Game.rooms).filter(room => room.controller?.my);

    myRooms.forEach(room => {
        const roomPopulation=room.memory.roomPopulation;
        if(!roomPopulation) {
            return;
        }
        const workerSpawnConfigs=roomPopulation.workerSpawnConfigs;

        handleRoomWorkerSpawning({room, roomWorkers: [], roomPopulation});
    });
}