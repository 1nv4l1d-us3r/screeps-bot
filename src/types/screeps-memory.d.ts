/**
 * Extend Screeps' global CreepMemory so creep.memory is typed everywhere.
 * No need to cast or use custom Creep & { memory: X } types.
 */

import { WorkerCreepMemory } from "../roles";
import { RoomDefenceMemory } from "../roomDefence/base";

declare global {
  interface CreepMemory extends WorkerCreepMemory {

  }
  interface RoomMemory extends RoomDefenceMemory {
    
  }
  interface Memory {
    testScript?: boolean;
  }
}

export {};
