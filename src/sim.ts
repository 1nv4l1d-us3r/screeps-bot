import { getAdjacentCoords, getCoordsInRange, getRightCoord, packCoord, unpackCoord } from "geometry";
import { PackedCoord } from "types/geometry";
import { Coord} from "types/geometry";
import { getCoordDistance } from "geometry";

export const loop = () => {

    console.log('sim loop');

    const simRoom=Game.rooms['sim'];

    const roomController=simRoom.controller;

    const storage=simRoom.storage;
    if(!storage){
        console.log('no storage');
        return;
    }

    const baseCoords=storage.pos

    // const upgraderContainerSpot = getUpgraderContainerSpot(roomController,baseCoords);


    
}



