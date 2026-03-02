import { RoomPlan } from "../../types/room/planner";
import { BasePlanner } from "./basePlanner";
import { MiningPlanner } from "./miningPlanner";


import { Coord } from "../../types/geometry";


export class RoomPlanner {


    public static run(myRooms: Room[]){
        myRooms.forEach(room => {
           this.updateRoomPlan(room);
        });
    }

    public static updateRoomPlan = (room: Room) => {
        const roomPlan = RoomPlanner.getRoomPlan(room);
        room.memory.roomPlan = roomPlan;
    }


    public static getRoomPlan = (room: Room): RoomPlan => {

        const roomPlan=room.memory.roomPlan;
        const newRoomPlan:Partial<RoomPlan>={};


        if(!roomPlan || !roomPlan.baseConfig) {
            const baseConfig = BasePlanner.getBaseConfig(room);
            newRoomPlan.baseConfig = baseConfig;
        }
        const baseCenterCoord=(roomPlan?.baseConfig.primarySpawnCoord || newRoomPlan.baseConfig?.primarySpawnCoord) as Coord;

        const miningConfig=MiningPlanner.getMiningConfigForRoom(room, baseCenterCoord);
        newRoomPlan.miningConfig = miningConfig;



        
        const updatedRoomPlan={...roomPlan, ...newRoomPlan} as RoomPlan;

        return updatedRoomPlan;
    }

}

