import { spiralCoordsGenerator } from "../../geometry";
import { 
    getTopCoord, 
    getBottomCoord, 
    getLeftCoord, 
    getRightCoord, 
    findCenterCoord, 
    findMaxDistanceCoord, 
    findMinDistanceCoord, 
    getAdjacentCoords, 
} from "../../geometry/coords";



import { BaseConfig } from "../../types/room/planner";
import { Coord } from "../../types/geometry";




export class BasePlanner {

    public static getBaseConfig= (room: Room): BaseConfig => {


        const roomTerrain=room.getTerrain();
        // TODO: use cache provider to get the room terrain ( use better bitmap instead of getTerrain )

        const roomController=room.controller;

        if(!roomController) {
            console.error('Room controller not found');
            throw new Error('Room controller not found');
            // should not happen because we are calling this function from the room planner
        }
        const roomControllerCoord={x:roomController.pos.x, y:roomController.pos.y};

        const mySpawns=room.find(FIND_MY_SPAWNS);

        let spawnCoord:Coord

        if(mySpawns) {
            const mySpawnsCoords=mySpawns.map(spawn => ({x:spawn.pos.x, y:spawn.pos.y}));
            const { minDistanceCoord: closestSpawnCoord } = findMinDistanceCoord({center: roomControllerCoord, targets: mySpawnsCoords });
            spawnCoord=closestSpawnCoord;
        }
        else {
            // finding teh spawn coord first

            const sources=room.find(FIND_SOURCES);
            // TODO: use cache provider to get the room sources
            const sourcesCoords=sources.map(source => ({x:source.pos.x, y:source.pos.y}));

            const roomCenterCoord=findCenterCoord([roomControllerCoord, ...sourcesCoords]);


            let foundSpawnCoord:Coord|undefined=undefined;
            const spawnCoordYieldFunction = (coord: Coord, index: number) => {
                
                if(roomTerrain.get(coord.x, coord.y) === TERRAIN_MASK_WALL) {
                    return false;
                }
                const adjacentCoords=getAdjacentCoords(coord);
                const allAdjacentBuildable=adjacentCoords.every(coord => {
                    return roomTerrain.get(coord.x, coord.y) !== TERRAIN_MASK_WALL;
                });
                if(!allAdjacentBuildable) {
                    return false;
                }
                foundSpawnCoord=coord;
                return true;
            }

            spiralCoordsGenerator({
                center: roomCenterCoord,
                yieldFunction: spawnCoordYieldFunction,
            });

            if(!foundSpawnCoord) {
                console.error('spawn coord not found, using room center coord as spawn coord');
                throw new Error('spawn coord not found');
            }

                spawnCoord=foundSpawnCoord;
        }

        let storageCenterCoord:Coord|undefined=undefined;

        const yieldFunction = (coord: Coord, index: number) => {


            if(roomTerrain.get(coord.x, coord.y) === TERRAIN_MASK_WALL) {
                return false;
            }
           
            const adjacentCoords=getAdjacentCoords(coord);
            const allAdjacentBuildable=adjacentCoords.every(coord => {
                return roomTerrain.get(coord.x, coord.y) !== TERRAIN_MASK_WALL;
            });

            if(!allAdjacentBuildable) {
                return false;
            }

            storageCenterCoord=coord;
            return true;
        
        }

        spiralCoordsGenerator({
            center: spawnCoord,
            cellStepSize:2, // space between cells
            spiralStepSize:3, // sparse search
            yieldFunction,
        });

        if(!storageCenterCoord){
            storageCenterCoord=spawnCoord
            console.error('storage center coord not found, using spawn coord as storage center');
            // should not happen
        }

        const topCoord=getTopCoord(storageCenterCoord) as Coord;
        const bottomCoord=getBottomCoord(storageCenterCoord) as Coord;
        const leftCoord=getLeftCoord(storageCenterCoord) as Coord;
        const rightCoord=getRightCoord(storageCenterCoord) as Coord;

        const { minDistanceCoord: storageCoord } = findMinDistanceCoord({ center: spawnCoord, targets: [topCoord, bottomCoord, leftCoord, rightCoord] });

        const { maxDistanceCoord: baseLinkCoord } = findMaxDistanceCoord({ center: spawnCoord, targets: [topCoord, bottomCoord, leftCoord, rightCoord] });

        const otherAdjacentCoords=getAdjacentCoords(storageCenterCoord).filter(coord => coord !== storageCoord && coord !== baseLinkCoord);

        const tempStorage1Coord=otherAdjacentCoords[0];
        const tempStorage2Coord=otherAdjacentCoords[1];

        const baseConfig: BaseConfig = {
            primarySpawnCoord: spawnCoord,
            storageCoord,
            baseLinkCoord,
            tempStorage1Coord,
            tempStorage2Coord,
        }
        return baseConfig;
    }
}