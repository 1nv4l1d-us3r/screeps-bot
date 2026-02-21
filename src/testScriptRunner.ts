// global way of test Scripts execution

import { testRoomPopulation } from "../tests/test";
import { testWorkerSpawning } from "../tests/test";
import { testExtensionsConstruction } from "../tests/extensions";
import { logCpuUsage } from "./cpuUsage";
import { testCoordinateFormats } from "../tests/coordinateBenchmark";



export const testScriptRunner = () => {
    const testScriptName=Memory.testScript;
    if(!testScriptName) {
        return;
    }

    const testFunction=testScripts[testScriptName];
    if(!testFunction) {
        return 
    }

    logCpuUsage({
        name: `testScript ${testScriptName} run`,
        func: testFunction,
    });

}

const testScripts:Record<string, () => void> = {
    'extensions': testExtensionsConstruction,
    'roomPopulation': testRoomPopulation,
    'workerSpawning': testWorkerSpawning,
    'coordinateBenchmark': testCoordinateFormats,
}









