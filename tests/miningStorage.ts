import { Coord } from "../src/types/geometry";

import { getMaxReachableNeighborCoords } from "../src/geometry/coords";

import { getMiningStorageStructureConfigs } from "../src/room/design/miningSites";

const manualTest=()=>{
    const sourceId='5bbcae999099fc012e639493' as Id<Source>;
    const source=Game.getObjectById(sourceId) 

    if(!source) {
        console.log('Source not found');
        return;
    }
    const sourceCoord:Coord={x:source.pos.x, y:source.pos.y};
    const roomTerrain=source.room.getTerrain();
    if(!roomTerrain) {
        console.log('Room terrain not found');
        return;
    }
    
    const miningCoord=getMaxReachableNeighborCoords({center:sourceCoord,roomTerrain});
    if(!miningCoord) {
        console.log('Mining coord not found');
        return;
    }
    console.log('Mining coord:', JSON.stringify(miningCoord,null,2));

    const linkCoord=getMaxReachableNeighborCoords({center:miningCoord,roomTerrain});
    if(!linkCoord) {
        console.log('Link coord not found');
        return;
    }
    console.log('Link coord:', JSON.stringify(linkCoord,null,2));
}



export const testMiningStorage = () => {

    const room=Game.rooms['E28S12'];
    if(!room) {
        console.log('Room not found');
        return;
    }
    const roomTerrain=room.getTerrain();

    const spawns=room.find(FIND_MY_SPAWNS);
    const firstSpawn=spawns[0];

    const baseCenter={x:firstSpawn.pos.x, y:firstSpawn.pos.y};


    const miningStorageStructureConfigs=getMiningStorageStructureConfigs({
        room,
        baseCenter,
        roomTerrain,
        occupiedPackedCoordsSet:new Set(),
    });
    console.log('Mining storage structure configs:', JSON.stringify(miningStorageStructureConfigs,null,2));

}