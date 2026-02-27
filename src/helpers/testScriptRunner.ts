// global way of test Scripts execution

import { testPopulationUpdate, testSpawnOrder } from "../../tests/roomPopulation";
import { testExtensionsConstruction } from "../../tests/extensions";
import { CpuProfiler } from "./cpuProfiler";
import { testCoordinateFormats } from "../../tests/coordinateBenchmark";
import { roomfindBenchmark } from "../../tests/roomfindBenchmark";
import { testSpawnConstruction } from "../../tests/testSpawnConstruction";
import { testRoomDesign } from "../../tests/roomDesign";
import { testMiningStorage } from "../../tests/miningStorage";



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
    'testPopulationUpdate': testPopulationUpdate,
    'testSpawnOrder': testSpawnOrder,
    'coordinateBenchmark': testCoordinateFormats,
    'roomfindBenchmark': roomfindBenchmark,
    'spawnConstruction': testSpawnConstruction,
    'roomDesign': testRoomDesign,
    'miningStorage': testMiningStorage,
}




/*

Memory.testScript='testSpawnOrder'

*/





