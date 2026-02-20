// global way of test Scripts execution

import { testRoomPopulation } from "../tests/test";
import { testWorkerSpawning } from "../tests/test";


const testMainFunction = () => {

    testWorkerSpawning();


}




const testScript = () => {
    const cpuUsageTestStart = Game.cpu.getUsed();

    testMainFunction();
    const cpuUsageTestEnd = Game.cpu.getUsed();
    const cpuUsageTest = Math.round((cpuUsageTestEnd - cpuUsageTestStart)*100)/100;
    console.log(`Test Script CPU Usage: ${cpuUsageTest}`);
}



export { 
    testScript 
};