
import {
     getCoordsInRange,
     getAdjacentCoords,
     getCoordDistance,
     packCoord,
     unpackCoord
 } from "geometry";


import { Coord, PackedCoord } from "types/geometry";

import { LogisticsConfig } from "types/room/planner";
import { MiningSiteConfig } from "types/room/planner";
import { getMaxBuildableStructuresByLevel } from "utils/gameConstants";



export class LogisticsPlanner {


    private static readonly UPGRADER_LINK_USAGE_DISTANCE=20;



    public static getLogisticsConfig = (room: Room, baseCenterCoord: Coord,miningConfig:MiningSiteConfig[]) => {

        const {upgraderStoragePackedCoord,upgraderStorageType}=this.getUpgraderContainerConfig(room,baseCenterCoord,miningConfig);
        const logisticsConfig: LogisticsConfig = {
            upgraderStoragePackedCoord,
            upgraderStorageType,
        }
        return logisticsConfig;
    }


   /*
    * This function finds the best spot for the upgrader container 
    */
   private static getUpgraderContainerConfig = (room: Room,baseCenterCoord:Coord,miningConfig:MiningSiteConfig[]) => {
        const controller=room.controller;


        const controllerSquare = getCoordsInRange({
            center: controller.pos,
            range: 3,
        });

        

        const visual=room.visual

        const terrain=room.getTerrain();


        const standableCoords=controllerSquare.filter(
            coord => terrain.get(coord.x,coord.y)!==TERRAIN_MASK_WALL
        );

        const standablePackedCoords:Set<PackedCoord>=new Set(standableCoords.map(coord => packCoord(coord)));



        let bestPackedCoord:PackedCoord|undefined=undefined;
        let bestScore=-Infinity;


        for(const coord of standableCoords){
            const packedCoord=packCoord(coord);

            const distanceFromBase=getCoordDistance(coord, baseCenterCoord);

            const neighbourCoords=getAdjacentCoords(coord)
            const standableNeighbours=neighbourCoords.filter(
                adjCoord => standablePackedCoords.has(packCoord(adjCoord))
            );
            const neighbourCount=standableNeighbours.length;
            const score=neighbourCount-distanceFromBase;
            if(score>bestScore){
                bestScore=score;
                bestPackedCoord=packedCoord;
            }
        }

        const upgraderStoragePackedCoord=bestPackedCoord;


        const upgraderStorageDistance=getCoordDistance(unpackCoord(upgraderStoragePackedCoord), baseCenterCoord);

        let upgraderStorageType:STRUCTURE_CONTAINER | STRUCTURE_LINK | undefined=undefined;

        let roomLevel=room.controller?.level||0;

        if(roomLevel<2){
            upgraderStorageType=undefined;
        }
        else if(upgraderStorageDistance>=this.UPGRADER_LINK_USAGE_DISTANCE){
            const maxLinks=getMaxBuildableStructuresByLevel(STRUCTURE_LINK, roomLevel);
            const usedLinks=miningConfig.filter(config => config.storageType===STRUCTURE_LINK).length;
            // 1 link is reserved for the base reciever
            const availableLinks=maxLinks-1-usedLinks;

            if(availableLinks>0){
                upgraderStorageType=STRUCTURE_LINK;
            }
            else {
                upgraderStorageType=STRUCTURE_CONTAINER;
            }
        }
        else {
            upgraderStorageType=STRUCTURE_CONTAINER;
        }


        return {
            upgraderStoragePackedCoord,
            upgraderStorageType
        };
    }


}