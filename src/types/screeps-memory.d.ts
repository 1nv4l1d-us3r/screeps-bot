/**
 * Extend Screeps' global CreepMemory so creep.memory is typed everywhere.
 * No need to cast or use custom Creep & { memory: X } types.
 */

import { WorkerCreepMemory } from "../roles";

declare global {
  interface CreepMemory extends WorkerCreepMemory {

  }
}

export {};
