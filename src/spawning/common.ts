

export const getBodyPartsCost=(bodyPart: BodyPartConstant | BodyPartConstant[])=> {

    if(Array.isArray(bodyPart)) {
        return bodyPart.reduce((acc, part) => acc + BODYPART_COST[part], 0);
    }
    return BODYPART_COST[bodyPart];
}




export const getAutoScaledBodyParts = (bodyParts: BodyPartConstant[],budget: number,maxBodyParts: number = 50) => {

    const bodyPartsSetCost = getBodyPartsCost(bodyParts);


    const affordableSetCount = Math.floor(budget / bodyPartsSetCost);

    let bodyArray: BodyPartConstant[]=[];

    if(affordableSetCount <=1) {
        bodyArray = bodyParts
        return bodyArray;
    }

    for(let i = 0; i < affordableSetCount && bodyArray.length < maxBodyParts; i++) {
        bodyArray.push(...bodyParts);
    }
    return bodyArray;
}
