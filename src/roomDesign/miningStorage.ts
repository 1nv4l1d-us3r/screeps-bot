import { getCoordDistance, getMaxReachableNeighborCoords,  } from "../geometry/coords";
import { Coord, PackedCoord } from "../types/geometry";
import { getMaxBuildableStructuresByLevel } from "../gameConstants";
import { StructureConstructionConfig } from "./common";

/*
minimum distance from source to base in order to use a link as transfer mechanism for energy.
*/
const LINK_USAGE_DISTANCE=20;





interface GetMiningStorageStructureConfigsParams {
    room: Room;
    baseCenter: Coord;
    roomTerrain: RoomTerrain;
    occupiedPackedCoordsSet: Set<PackedCoord>;
}

/**
 * Finds the best storage type and coords for mining storage structures in a room.
 * @param params - The parameters for the function.
 * @returns The best storage type and coords for mining storage structures in a room.
 */
export const getMiningStorageStructureConfigs = (params: GetMiningStorageStructureConfigsParams): StructureConstructionConfig[] => {
    const {
        room,
        baseCenter,
        roomTerrain,
        occupiedPackedCoordsSet
    } = params;

    const storageStructureConfigs: StructureConstructionConfig[] = [];
    
    
    const roomLevel=room.controller?.level||0;
    const sources=room.find(FIND_SOURCES);
    if(!sources.length) {
        return [];
    }

    const sourceDistanceMap=new Map<Id<Source>, number>();
    sources.forEach(source => {
        const sourceCoord={x:source.pos.x, y:source.pos.y} as Coord;
        const distanceToBase=getCoordDistance(sourceCoord, baseCenter);
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
        const distanceToBase=sourceDistanceMap.get(source.id)||0;
        let useLinkStorage:boolean=false;
        if(distanceToBase >= LINK_USAGE_DISTANCE && availableLinks>0) {
            useLinkStorage=true;
        }
       
        const storageType=useLinkStorage?STRUCTURE_LINK:STRUCTURE_CONTAINER;

        let storageCoord:Coord|undefined;

        if(storageType==STRUCTURE_CONTAINER){
            
            storageCoord=getMiningCoordForResource(sourceCoord,roomTerrain)
            // place container at mining spot
        }
        else if(storageType==STRUCTURE_LINK){
            storageCoord=getLinkCoordForSource(sourceCoord,roomTerrain)
            if(storageCoord && availableLinks>0) {
                availableLinks--;
            }
        }
  
        if(storageCoord) {

            const sourceStorageConfig: StructureConstructionConfig = {
                coord: storageCoord,
                structureType: storageType
            }
            storageStructureConfigs.push(sourceStorageConfig);
        }
    });


    if(roomLevel>=6){
        const minerals=room.find(FIND_MINERALS);
        minerals.forEach(mineral => {
            const mineralCoord={x:mineral.pos.x, y:mineral.pos.y} as Coord;

            const mineralStorageCoord=getMiningCoordForResource(mineralCoord,roomTerrain)
            if(!mineralStorageCoord) {
                return;
            }
            if(mineralStorageCoord) {
                const mineralStorageConfig: StructureConstructionConfig = {
                    coord: mineralStorageCoord,
                    structureType: STRUCTURE_CONTAINER
                }
                const extractorConfig: StructureConstructionConfig = {
                    coord: mineralCoord,
                    structureType: STRUCTURE_EXTRACTOR
                }
                storageStructureConfigs.push(mineralStorageConfig);
                storageStructureConfigs.push(extractorConfig);
            }
        });
    }


    return storageStructureConfigs;
}




const getMiningCoordForResource = (resourceCoord: Coord,roomTerrain: RoomTerrain) => {

    const miningCoord=getMaxReachableNeighborCoords({center:resourceCoord,roomTerrain})
    return miningCoord;
}


const getLinkCoordForSource = (sourceCoord: Coord,roomTerrain: RoomTerrain) => {

    const miningCoord=getMaxReachableNeighborCoords({center:sourceCoord,roomTerrain})
    if(!miningCoord) {
        return;
    }

    // place link next to mining spot
    const linkCoord=getMaxReachableNeighborCoords({center:miningCoord,roomTerrain})
    return linkCoord;
}