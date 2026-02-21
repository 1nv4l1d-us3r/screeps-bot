// global way of test Scripts execution

import { testRoomPopulation } from "../tests/test";
import { testWorkerSpawning } from "../tests/test";
import { testExtensionsConstruction } from "../tests/extensions";
import { logCpuUsage } from "./cpuUsage";


const testScript = () => {
    logCpuUsage({
        name: 'testScript',
        func: () => {
            testMainFunction();
        }
    });
}

export { 
    testScript 
};





const testMainFunction = () => {

    testExtensionsConstruction();


}






