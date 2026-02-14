import dotenv from "dotenv";

dotenv.config({  path: ".env", debug: false});

if (!process.env.SCREEPS_AUTH_TOKEN) {
    throw new Error("SCREEPS_AUTH_TOKEN environment variable is not set");
}

export const config = {
    screepsAuthToken: process.env.SCREEPS_AUTH_TOKEN,
}