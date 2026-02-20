
export const getMaxSpawnsByLevel = (rcl: number) => {
    if(rcl >= 1 && rcl <= 6) 
        return 1;
    else if(rcl===7)
        return 2;
    else if(rcl===8) 
        return 3;
    else
        return 0;
}


export const getMaxExtensionsByLevel = (rcl: number) => {
    if(rcl===1)
        return 0;
    else if(rcl===2)
        return 5;
    else if(rcl>=3 && rcl<=8){
        const multiplier = rcl-2;
        return 10*multiplier;
    }
    return 0;
}


export const getMaxTowersByLevel = (rcl: number) => {
    if(rcl<2)
        return 0;
    else if(rcl<5)
        return 1;
    else if(rcl<7)
        return 2;
    else if(rcl===7)
        return 3;
    else if(rcl===8)
        return 6;

    return 0;
}




export const getMaxLinksByLevel = (rcl: number) => {
    if(rcl<5)
        return 0;
    else if( rcl>=5 && rcl<=8)
        return rcl-3; // 5:2, 6:3, 7:4, 8:6
    else
        return 0;
    }