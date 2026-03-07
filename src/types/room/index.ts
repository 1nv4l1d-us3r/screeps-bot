import { HeatMap } from "../common";
import { RoomPlan } from "./planner";
import { RoomOperations } from "./managers";

export interface CustomRoomMemory {
    roomPlan?: RoomPlan;
    roomOperations?: RoomOperations;
    
    hasHostileCreeps?:boolean;
    
    
    fatigueHeatMap?: HeatMap;
    isMonitoringFatigue?:boolean;
}
