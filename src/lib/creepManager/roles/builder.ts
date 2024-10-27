export const builder = (creep: Creep) => {
  if (creep.ticksToLive && creep.ticksToLive < 10) {
    creep.say("I'm dying");
    creep.drop(RESOURCE_ENERGY);
    return;
  }

  const memory = creep.memory;

  if (memory.working && creep.store[RESOURCE_ENERGY] === 0) {
    memory.working = false;
    memory.targetId = undefined;
    creep.say("🔄 need");
  }
  if (!memory.working && creep.store.getFreeCapacity() === 0) {
    memory.working = true;
    creep.say("🚧 build");
  }

  if (memory.working) {
    performWork(creep);
  } else {
    waitForEnergy(creep);
  }
};

const performWork = (creep: Creep): void => {
  const target = getCurrentOrFindNewBuildTarget(creep);

  if (target) {
    buildStructure(creep, target);
  } else {
    upgradeController(creep);
  }
};

const getCurrentOrFindNewBuildTarget = (creep: Creep): ConstructionSite | null => {
  if (creep.memory.targetId) {
    const savedTarget = Game.getObjectById(creep.memory.targetId as Id<ConstructionSite>);

    if (savedTarget) return savedTarget;

    creep.memory.targetId = undefined;
  }

  const newTarget = findBuildTarget(creep);

  if (newTarget) {
    creep.memory.targetId = newTarget.id;
  }

  return newTarget;
};

const findBuildTarget = (creep: Creep): ConstructionSite | null => {
  const priorities: StructureConstant[] = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_CONTAINER,
    STRUCTURE_TOWER,
    STRUCTURE_ROAD,
    STRUCTURE_WALL,
  ];

  const builderTargets = creep.room
    .find(FIND_MY_CREEPS)
    .filter((c) => c.memory.role === "builder" && c.id !== creep.id && c.memory.targetId)
    .reduce(
      (count, builder) => {
        const targetId = builder.memory.targetId as Id<ConstructionSite>;
        count[targetId] = (count[targetId] || 0) + 1;
        return count;
      },
      {} as { [key: string]: number },
    );

  for (const structureType of priorities) {
    const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
      filter: (site) =>
        site.structureType === structureType && (!builderTargets[site.id] || builderTargets[site.id] < 2),
    });
    if (target) return target;
  }

  return creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
    filter: (site) => !builderTargets[site.id] || builderTargets[site.id] < 2,
  });
};

const buildStructure = (creep: Creep, target: ConstructionSite): void => {
  const buildResult = creep.build(target);

  switch (buildResult) {
    case OK:
      creep.say("🏗️");
      break;
    case ERR_NOT_IN_RANGE:
      creep.moveTo(target, {
        visualizePathStyle: { stroke: "#ffffff" },
        reusePath: 5,
      });
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      creep.memory.working = false;
      break;
    case ERR_INVALID_TARGET:
      creep.memory.targetId = undefined;
      break;
  }
};

const upgradeController = (creep: Creep): void => {
  const controller = creep.room.controller;
  if (!controller) return;

  const upgradeResult = creep.upgradeController(controller);

  switch (upgradeResult) {
    case OK:
      creep.say("⚡");
      break;
    case ERR_NOT_IN_RANGE:
      creep.moveTo(controller, {
        visualizePathStyle: { stroke: "#ffffff" },
        reusePath: 5,
      });
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      creep.memory.working = false;
      break;
  }
};

const waitForEnergy = (creep: Creep): void => {
  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) =>
      (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
      s.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(),
  });

  if (container) {
    if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(container, {
        visualizePathStyle: { stroke: "#ffaa00" },
        reusePath: 5,
      });
    }
  } else {
    const target = findBuildTarget(creep) || creep.room.controller;

    if (target) {
      creep.moveTo(target, {
        visualizePathStyle: { stroke: "#ffaa00" },
        range: 3,
        reusePath: 5,
      });
    }
    creep.say("⚡ wait");
  }
};
