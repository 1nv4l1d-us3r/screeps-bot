import dotenv from "dotenv";

dotenv.config({  path: ".env", debug: false});



const requireEnv=(key:string):string=>{
    const value=process.env[key]
    if(!value || value.trim() === ''){
        throw new Error(`${key} environment variable is not set`);
    }
    return value;
}

export const config = {
    screepsAuthToken: requireEnv("SCREEPS_AUTH_TOKEN"),
    screepsHost: requireEnv("SCREEPS_HOST"),
    screepsPath: requireEnv("SCREEPS_PATH"),
}