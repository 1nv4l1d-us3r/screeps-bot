import { Coord } from "../geometry";

/*
Config that lays the ground for the base construction.
*/
export interface BaseConfig{
    primarySpawnCoord: Coord;
    storageCoord: Coord;
    baseLinkCoord: Coord;
    tempStorage1Coord: Coord;
    tempStorage2Coord: Coord;
}   



/*
Config that defines the mining sites and storage details.
*/
export interface MiningSiteConfig{
    resourceId: Id<Source | Mineral>;
    resourceType: RESOURCE_ENERGY | MineralConstant;
    miningCoord: Coord;
    storageType?: STRUCTURE_CONTAINER | STRUCTURE_LINK;
    storageCoord?: Coord;
}


// TODO: implement this later
interface LinkConfig{
    linkCoord: Coord;
    type:any
}



export interface RoomPlan{
    baseConfig: BaseConfig;
    miningConfig: MiningSiteConfig[];
}