import { getMyRooms } from "utils/commonFunctions";
import { RoomPlanner } from "room/planners/roomPlanner";

export const testRoomPlanning = () => {

    const myRooms = getMyRooms();
    for (const room of myRooms) {
        RoomPlanner.updateRoomPlan(room);
    }
}