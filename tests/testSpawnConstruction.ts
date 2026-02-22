import { packCoord } from "../src/geometry/packedCords";
import { CpuProfiler } from "../src/helpers/cpuProfiler";

import { getFirstSpawnConstructionCoord } from "../src/roomDesign/spawn";
import { PackedCoord } from "../src/types/geometry";

export const testSpawnConstruction = () => {
    const room=Game.rooms['E28S12'];
    if(!room) {
        console.log('Room E28S12 not found');
        return;
    }
    CpuProfiler.log("getTerrain");
    const roomTerrain = room.getTerrain();
    CpuProfiler.logEnd("getTerrain");

    CpuProfiler.log("find structures and construction sites");
    const roomStructures = room.find(FIND_STRUCTURES);
    const roomConstructionsSites=room.find(FIND_CONSTRUCTION_SITES);
    CpuProfiler.logEnd("find structures and construction sites");

    CpuProfiler.log("adding occupied coords to set");
    const occupiedPackedCoordsSet = new Set<PackedCoord>()
    roomStructures.forEach(st => {
        occupiedPackedCoordsSet.add(packCoord({x:st.pos.x, y:st.pos.y}));
    });
    roomConstructionsSites.forEach(cs => {
        occupiedPackedCoordsSet.add(packCoord({x:cs.pos.x, y:cs.pos.y}));
    });
    CpuProfiler.logEnd("adding occupied coords to set");

    const controller=room.controller;
    if(!controller) {
        console.log('Room E28S12 not found');
        return;
    }
   

    CpuProfiler.log("getting first spawn coords");
    const spawnCoord=getFirstSpawnConstructionCoord({
        room,
        roomTerrain,
        occupiedPackedCoordsSet,
    });
    CpuProfiler.logEnd("getting first spawn coords");

    if(spawnCoord) {
        CpuProfiler.log("visualizing first spawn coords");
        const visual=room.visual;
        visual.circle(spawnCoord.x, spawnCoord.y,{fill:'green', radius:0.5});
        CpuProfiler.logEnd("visualizing first spawn coords");
    }


}