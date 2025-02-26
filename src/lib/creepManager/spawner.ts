import { CreepConfig, CreepCount, CreepRole } from "types/creeps";

const maxCreeps: CreepCount = {
  harvester: 10,
  courier: 10,
  builder: 15,
};

const creepConfigs: CreepConfig = {
  harvester: {
    body: [WORK, WORK, CARRY, MOVE],
    memory: (room: Room): CreepMemory => ({
      role: "harvester",
      room: room,
      working: false,
      sourceId: undefined,
      targetId: undefined,
      state: undefined,
    }),
  },
  builder: {
    body: [WORK, WORK, CARRY, MOVE],
    memory: (room: Room): CreepMemory => ({
      role: "builder",
      room: room,
      working: false,
      sourceId: undefined,
      targetId: undefined,
      state: undefined,
    }),
  },
  courier: {
    body: [CARRY, CARRY, MOVE, MOVE, MOVE],
    memory: (room: Room): CreepMemory => ({
      role: "courier",
      room: room,
      working: false,
      sourceId: undefined,
      targetId: undefined,
      state: undefined,
    }),
  },
};

export const creepSpawner = () => {
  const roleToSpawn = getNextCreepToSpawn();

  if ((Game.spawns["Main Spawn"].spawning?.needTime || 0) > 0) return;

  if (roleToSpawn) {
    const creepConfig = creepConfigs[roleToSpawn];
    const newName = generateCreepName(roleToSpawn);

    const result = Game.spawns["Main Spawn"].spawnCreep(creepConfig.body, newName, {
      memory: creepConfig.memory(Game.spawns["Main Spawn"].room),
    });

    switch (result) {
      case OK:
        console.log(`Spawning new ${roleToSpawn}: ${newName}`);
        break;
      default:
        break;
    }
  }
};

export const generateCreepName = (role: CreepRole): string => {
  return `${role.charAt(0).toUpperCase() + role.slice(1)}${Game.time}`;
};

export const getNextCreepToSpawn = (): CreepRole | null => {
  const currentCounts = countCreepsByRole();

  for (const role in maxCreeps) {
    const currentCount = currentCounts[role as CreepRole];
    if (currentCount < maxCreeps[role as CreepRole]) {
      return role as CreepRole;
    }
  }

  return null;
};

export const countCreepsByRole = (): CreepCount => {
  const counts: CreepCount = {
    harvester: 0,
    builder: 0,
    courier: 0,
  };

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const role = creep.memory.role;
    counts[role]++;
  }

  return counts;
};
