import { RoomPlan } from "../../types/room/planner";
import { BasePlanner } from "./basePlanner";
import { MiningPlanner } from "./miningPlanner";
import { PopulationPlanner } from "./populationPlanner";


import { Coord } from "../../types/geometry";

import { Scheduler } from "../../helpers/Scheduler";
import { CommonFunctions } from "../../utils/commonFunctions";

import { LogisticsPlanner } from "./logisticsPlanner";


export class RoomPlanner {


    public static startDeamon(){

        Scheduler.createRecurringJob({
            name: 'RoomPlannerDeamon',
            interval: 500,
            func: this.startRoomPlannerJobs,
        })

    }


    /*
    Run the room planner for all the my rooms.
    - uses the job scheduler to spread processing of each room at same tick.
    */
    private static startRoomPlannerJobs(){

        const myRooms=CommonFunctions.getMyRooms();

        Scheduler.createOneTimeJobs({
            list: myRooms,
            nameGenerator: (room) => 'UpdateRoomPlan-' + room.name,
            delay: 2,
            offset: 2,
            func: (room) => RoomPlanner.updateRoomPlan(room),
        })
    }

    public static getRoomPlan = (room: Room) => {
        let roomPlan = room.memory.roomPlan;
        if(!roomPlan) {
            RoomPlanner.updateRoomPlan(room);
            roomPlan = room.memory.roomPlan;
        }
        return roomPlan;
    }



    public static updateRoomPlan = (room: Room) => {

        const roomPlan=room.memory.roomPlan;
        const newRoomPlan:Partial<RoomPlan>={};


        if(!roomPlan || !roomPlan.baseConfig) {
            const baseConfig = BasePlanner.getBaseConfig(room);
            newRoomPlan.baseConfig = baseConfig;
        }
        const baseCenterCoord=(roomPlan?.baseConfig.primarySpawnCoord || newRoomPlan.baseConfig?.primarySpawnCoord) as Coord;

        const miningConfig=MiningPlanner.getMiningConfigForRoom(room, baseCenterCoord);
        newRoomPlan.miningConfig = miningConfig;

        const populationConfig = PopulationPlanner.getPopulationConfigForRoom(room, miningConfig);
        newRoomPlan.populationConfig = populationConfig;

        const logisticsConfig=LogisticsPlanner.getLogisticsConfig(room, baseCenterCoord, miningConfig);
        newRoomPlan.logisticsConfig = logisticsConfig;


        
        const updatedRoomPlan={...roomPlan, ...newRoomPlan} as RoomPlan;

        room.memory.roomPlan = updatedRoomPlan;
    }

}

