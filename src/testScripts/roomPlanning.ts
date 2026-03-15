import { CommonFunctions } from "utils/commonFunctions";
import { RoomPlanner } from "room/planners/roomPlanner";

export const testRoomPlanning = () => {

    const myRooms = CommonFunctions.getMyRooms();
    for (const room of myRooms) {
        RoomPlanner.updateRoomPlan(room);
    }
}