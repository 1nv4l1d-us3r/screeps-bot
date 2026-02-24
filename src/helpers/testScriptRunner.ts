// global way of test Scripts execution

import { testRoomPopulation } from "../../tests/test";
import { testWorkerSpawning } from "../../tests/test";
import { testExtensionsConstruction } from "../../tests/extensions";
import { CpuProfiler } from "./cpuProfiler";
import { testCoordinateFormats } from "../../tests/coordinateBenchmark";
import { roomfindBenchmark } from "../../tests/roomfindBenchmark";
import { testSpawnConstruction } from "../../tests/testSpawnConstruction";
import { testRoomDesign } from "../../tests/roomDesign";


export const testScriptRunner = () => {
    const testScriptName=Memory.testScript;
    if(!testScriptName) {
        return;
    }

    const testFunction=testScripts[testScriptName];
    if(!testFunction) {
        return 
    }

    CpuProfiler.profileFunction(
        {
            name: `testScript ${testScriptName} run`, 
            func: testFunction
        }
        
    );
}

const testScripts:Record<string, () => void> = {
    'extensions': testExtensionsConstruction,
    'roomPopulation': testRoomPopulation,
    'workerSpawning': testWorkerSpawning,
    'coordinateBenchmark': testCoordinateFormats,
    'roomfindBenchmark': roomfindBenchmark,
    'spawnConstruction': testSpawnConstruction,
    'roomDesign': testRoomDesign,
}




/*

Memory.testScript='roomDesign'

*/





