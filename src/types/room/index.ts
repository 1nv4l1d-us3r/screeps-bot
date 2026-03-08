import { HeatMap } from "../common";
import { RoomPlan } from "./planner";
import { LogisticsOperation, RoomOperations, SpawningOperation } from "./managers";

export interface CustomRoomMemory {
    roomPlan?: RoomPlan;
    spawning?:SpawningOperation;
    logistics?:LogisticsOperation;
    
    roomOperations?: RoomOperations;
    hasHostileCreeps?:boolean;
    
    fatigueHeatMap?: HeatMap;
    isMonitoringFatigue?:boolean;
}
