import { getCoordDistance, getMaxReachableNeighborCoords,  } from "../../geometry/coords";
import { getMaxBuildableStructuresByLevel } from "../../utils/gameConstants";

import { MiningSiteConfig } from "../../types/room/planner";
import { Coord } from "../../types/geometry";

/*
minimum distance from source to base in order to use a link as transfer mechanism for energy.
*/




export class MiningPlanner {

    private static readonly LINK_USAGE_DISTANCE=20;
    // minimum distance from source to base in order to use a link as transfer mechanism for energy.


    public static  getMiningConfigForRoom= (room: Room,baseCenterCoord: Coord): MiningSiteConfig[] => {
    
        const miningSiteConfigs: MiningSiteConfig[] = [];
        
        const roomLevel=room.controller?.level||0;
        const sources=room.find(FIND_SOURCES);
        // TODO: use cache provider to get the sources
    
    
        const roomTerrain=room.getTerrain();
        // TODO: use cache provider to get the room terrain ( use better bitmap instead of getTerrain )
    
        if(!sources.length) {
            return [];
        }
    
        const sourceDistanceMap=new Map<Id<Source>, number>();
        sources.forEach(source => {
            const sourceCoord={x:source.pos.x, y:source.pos.y} as Coord;
            const distanceToBase=getCoordDistance(sourceCoord, baseCenterCoord);
            sourceDistanceMap.set(source.id, distanceToBase);
        });
    
        sources.sort(
            (a,b)=>{
                return (sourceDistanceMap.get(a.id)||0) - (sourceDistanceMap.get(b.id)||0);
            }
        );
    
        const maxBuildableLinks=getMaxBuildableStructuresByLevel(STRUCTURE_LINK, roomLevel);
        let  availableLinks=maxBuildableLinks-1;  // 1 link is reserved for the base reciever
        
        
        sources.forEach(source => {
            const sourceCoord:Coord={x:source.pos.x, y:source.pos.y}        
            
            let storageType:MiningSiteConfig['storageType']
            let miningCoord:MiningSiteConfig['miningCoord'];
            let storageCoord:MiningSiteConfig['storageCoord'];
    
    
            if(roomLevel<2){
                storageType=undefined
            }
            else {
                const distanceToBase=sourceDistanceMap.get(source.id)||0;
    
                if(distanceToBase >= this.LINK_USAGE_DISTANCE && availableLinks>0){
                    storageType=STRUCTURE_LINK;
                }
                else {
                    storageType=STRUCTURE_CONTAINER;
                }
            }
    
    
            const sourceMiningCoord=getMaxReachableNeighborCoords({center:sourceCoord,roomTerrain})
            if(!sourceMiningCoord) {
                return;   // kinda un reachable case, should not happen
            }
            miningCoord=sourceMiningCoord;
            
            if(storageType==STRUCTURE_CONTAINER){
                storageCoord=sourceMiningCoord;
                // place the container at the mining spot
            }
            else if(storageType==STRUCTURE_LINK){
    
                const sourceLinkCoord=getMaxReachableNeighborCoords({center:miningCoord,roomTerrain})
    
                if(sourceLinkCoord && availableLinks>0) {
                    availableLinks--;
                    storageCoord=sourceLinkCoord;
                }
                else {
                    storageCoord=miningCoord;
                    storageType=STRUCTURE_CONTAINER;
                    // fallback to container if link is not available or cannot be placed next to the mining spot
                }
            }
    
    
            const sourceMiningSiteConfig: MiningSiteConfig = {
                resourceId: source.id,
                resourceType: RESOURCE_ENERGY,
                miningCoord,
                storageType,
                storageCoord
            }
            miningSiteConfigs.push(sourceMiningSiteConfig);
        });
    
    
        if(roomLevel>=6){
            const minerals=room.find(FIND_MINERALS);
            minerals.forEach(mineral => {

                if(mineral.mineralAmount === 0 && (mineral.ticksToRegeneration|| Infinity) > 1000 ) {
                    // mineral in cooldown, so we don't need to extract it
                    return;
                }
                const mineralCoord={x:mineral.pos.x, y:mineral.pos.y} as Coord;
    
    
    
                let miningCoord:MiningSiteConfig['miningCoord'];
                let storageType:MiningSiteConfig['storageType'];
                let storageCoord:MiningSiteConfig['storageCoord'];
                let extractorCoord:Coord=mineralCoord
    
    
                const mineralMiningCoord=getMaxReachableNeighborCoords({center:mineralCoord,roomTerrain})
                if(!mineralMiningCoord) {
                    return;   // kinda un reachable case, should not happen
                }
                miningCoord=mineralMiningCoord;
                storageType=STRUCTURE_CONTAINER;
                storageCoord=mineralMiningCoord;
                 // place the container at the mineral spot
    
                const mineralStorageConfig: MiningSiteConfig = {
                    resourceId: mineral.id,
                    resourceType: mineral.mineralType,
                    miningCoord,
                    storageType,
                    storageCoord,
                    extractorCoord
                }
                miningSiteConfigs.push(mineralStorageConfig);
            });
        }
    
    
        return miningSiteConfigs;
    }


}





