export const courier = (creep: Creep) => {
  if (creep.ticksToLive && creep.ticksToLive < 10) {
    creep.say("💀");
    creep.drop(RESOURCE_ENERGY);
    return;
  }

  if (creep.store.getFreeCapacity() === 0) {
    deliverEnergy(creep);
  } else {
    collectEnergy(creep);
  }
};

const collectEnergy = (creep: Creep): void => {
  if (collectDroppedEnergy(creep)) return;
  if (collectFromHarvesters(creep)) return;
  if (collectFromMiningStorages(creep)) return;
};

const deliverEnergy = (creep: Creep): void => {
  if (deliverToSpawnAndExtensions(creep)) return;
  if (deliverFromMineStorageToOtherStorages(creep)) return;
};

const collectDroppedEnergy = (creep: Creep): boolean => {
  const droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: (resource) =>
      resource.resourceType === RESOURCE_ENERGY && resource.amount >= creep.store.getFreeCapacity() * 0.5,
  });

  if (!droppedEnergy) return false;

  switch (creep.pickup(droppedEnergy)) {
    case ERR_NOT_IN_RANGE:
      moveToTarget(creep, droppedEnergy, true);
      break;
    case ERR_FULL:
      return false;
  }

  return true;
};

const collectFromMiningStorages = (creep: Creep): boolean => {
  const mineStorage = Game.flags["Mine Storage"];

  if (!mineStorage) return false;

  const container = mineStorage.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0,
  });

  if (!container) return false;

  switch (creep.withdraw(container, RESOURCE_ENERGY)) {
    case ERR_NOT_IN_RANGE:
      moveToTarget(creep, container, true);
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      return false;
  }

  return true;
};

const collectFromHarvesters = (creep: Creep): boolean => {
  if (!creep.memory.targetId || Game.getObjectById(creep.memory.targetId) === null) {
    const busyHarvesters = new Set(
      creep.room
        .find(FIND_MY_CREEPS)
        .filter((c) => c.memory.role === "courier" && c.id !== creep.id)
        .map((c) => c.memory.targetId),
    );

    const harvester = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
      filter: (c) =>
        c.memory.role === "harvester" &&
        c.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity() * 0.5 &&
        !busyHarvesters.has(c.id),
    });

    if (!harvester) return false;
    creep.memory.targetId = harvester.id;
  }

  const harvester = Game.getObjectById(creep.memory.targetId as Id<Creep>);
  if (!harvester || harvester.store[RESOURCE_ENERGY] === 0) {
    creep.memory.targetId = undefined;
    return false;
  }

  if (harvester.transfer(creep, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, harvester, true);
  }
  return true;
};

const deliverToSpawnAndExtensions = (creep: Creep): boolean => {
  const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (s) =>
      (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) &&
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
  });

  if (!target) return false;

  if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, target);
  }
  return true;
};

const deliverFromMineStorageToOtherStorages = (creep: Creep): boolean => {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) =>
      (s.structureType === STRUCTURE_TOWER ||
        s.structureType === STRUCTURE_STORAGE ||
        s.structureType === STRUCTURE_CONTAINER) &&
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
      Game.flags["Mine Storage"].pos.getRangeTo(s.pos) > 5,
  });

  if (!target) return false;

  if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, target);
  }

  return true;
};

const moveToTarget = (creep: Creep, target: RoomPosition | _HasRoomPosition, collecting: boolean = false): void => {
  creep.moveTo(target, {
    visualizePathStyle: { stroke: collecting ? "#ffaa00" : "#ffffff" },
    reusePath: 5,
  });
};
