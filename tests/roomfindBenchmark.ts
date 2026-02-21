import { logCpuUsage } from "../src/cpuUsage";

const ROOM = "E28S12";
const ITERATIONS = 50;

export const roomfindBenchmark = () => {
    const room=Game.rooms[ROOM];
    const terrain=room.getTerrain();
    if(!room) {
        console.log('Room not found');
        return;
    }
    logCpuUsage({
        name: "Room Finding",
        func: () => {
            for(let i = 0; i < ITERATIONS; i++) {
                room.find(FIND_STRUCTURES);
            }
        }
    });
    logCpuUsage({
        name: "Room Finding with filter",
        func: () => {
            for(let i = 0; i < ITERATIONS; i++) {
                room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_EXTENSION });
            }
        }
    });
    logCpuUsage({
        name: "Room Finding with distance filter",
        func: () => {
            for(let i = 0; i < ITERATIONS; i++) {
                const center=new RoomPosition(25,25,ROOM);
                const structures=center.findInRange(FIND_STRUCTURES, 10);
            }
        }
    });

    logCpuUsage({
        name: "getting terrain",
        func: () => {
            for(let i = 0; i < ITERATIONS; i++) {
                const terrain=room.getTerrain();
            }
        }
    });
    logCpuUsage({
        name: "getting data from terrain",
        func: () => {
            for(let i = 0; i < ITERATIONS; i++) {
                terrain.get(25,i);
            }
        }
    });
}
