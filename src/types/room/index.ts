import { HeatMap } from "../common";
import { RoomPlan } from "./planner";
import { ConstructionOperation, LogisticsOperation, SpawningOperation } from "./managers";

export interface CustomRoomMemory {
    roomPlan?: RoomPlan;
   
    spawning?:SpawningOperation;
    logistics?:LogisticsOperation;
    construction?: ConstructionOperation;
    
    hasHostileCreeps?:boolean;
    
    fatigueHeatMap?: HeatMap;
    isMonitoringFatigue?:boolean;
}
