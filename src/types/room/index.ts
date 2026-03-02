import { HeatMap } from "../common";
import { RoomPopulation } from "./population";
import { RoomPlan } from "./planner";
import { RoomOperations } from "./managers";

export interface CustomRoomMemory {
    roomPlan?: RoomPlan;
    roomOperations?: RoomOperations;
    
    hasHostileCreeps?:boolean;
    
    roomPopulation?: RoomPopulation;
    
    fatigueHeatMap?: HeatMap;
    isMonitoringFatigue?:boolean;
}
