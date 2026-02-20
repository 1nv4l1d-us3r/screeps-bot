import { HeatMap } from "./common";


export interface CustomRoomMemory {
    hasHostileCreeps?:boolean;


    isMonitoringFatigue?:boolean;
    fatigueHeatMap?: HeatMap;
}

