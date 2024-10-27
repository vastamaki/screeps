import { builder } from "lib/creepManager/roles/builder";
import { courier } from "lib/creepManager/roles/courier";
import { harvester } from "lib/creepManager/roles/harvester";
import { creepSpawner } from "lib/creepManager/spawner";

export const creepManager = () => {
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  creepSpawner();

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];

    // If creep is too close spawn, move away
    if (creep.pos.inRangeTo(creep.room.find(FIND_MY_SPAWNS)[0], 5)) {
      creep.move(creep.pos.getDirectionTo(creep.room.controller as StructureController));
    }

    switch (creep.memory.role) {
      case "builder":
        builder(creep);
        break;
      case "harvester":
        harvester(creep);
        break;
      case "courier":
        courier(creep);
        break;
      default:
        break;
    }
  }
};
