// global way of test Scripts execution

import { testRoomPopulation } from "../tests/test";


const testScript = () => {
    const cpuUsageStart = Game.cpu.getUsed();

    testRoomPopulation();
    const cpuUsageEnd = Game.cpu.getUsed();
    const cpuUsage = cpuUsageEnd - cpuUsageStart;
    console.log(`Test Script CPU Usage: ${cpuUsage}`);
}



export { 
    testScript 
};