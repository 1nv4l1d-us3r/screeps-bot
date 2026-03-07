import { HeatMap } from "../common";
import { RoomPlan } from "./planner";
import { RoomOperations, SpawningOperation } from "./managers";

export interface CustomRoomMemory {
    roomPlan?: RoomPlan;
    roomOperations?: RoomOperations;
    spawning?:SpawningOperation;
    
    hasHostileCreeps?:boolean;
    
    
    fatigueHeatMap?: HeatMap;
    isMonitoringFatigue?:boolean;
}
