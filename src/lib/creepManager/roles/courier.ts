export const courier = (creep: Creep) => {
  if (creep.ticksToLive && creep.ticksToLive < 10) {
    creep.say("I'm dying");
    creep.drop(RESOURCE_ENERGY);
    return;
  }

  if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.working = false;
    creep.say("🔄 collect");
  }

  if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
    creep.say("📦 deliver");
  }

  if (!creep.memory.working) {
    if (!findDroppedEnergy(creep)) {
      if (!getEnergyFromContainers(creep)) {
        getEnergyFromHarvesters(creep);
      }
    }
  } else {
    if (!deliverEnergyToSpawn(creep)) {
      if (!deliverEnergyToBuilders(creep)) {
        deliverEnergyToStorage(creep);
      }
    }
  }
};

const findDroppedEnergy = (creep: Creep): boolean => {
  const droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: (resource) =>
      resource.resourceType === RESOURCE_ENERGY && resource.amount >= creep.store.getFreeCapacity() * 0.5,
  });

  if (!droppedEnergy) return false;

  if (creep.pickup(droppedEnergy) === ERR_NOT_IN_RANGE) {
    creep.moveTo(droppedEnergy, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
  return true;
};

const getEnergyFromContainers = (creep: Creep): boolean => {
  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(),
  });

  if (!container) return false;

  if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    creep.moveTo(container, { visualizePathStyle: { stroke: "#ffaa00" } });
  }
  return true;
};

const getEnergyFromHarvesters = (creep: Creep): boolean => {
  if (creep.memory.targetId) {
    const currentTarget = Game.getObjectById(creep.memory.targetId as Id<Creep>);
    if (!currentTarget || currentTarget.store[RESOURCE_ENERGY] === 0) {
      creep.memory.targetId = undefined;
    }
  }

  const courierTargets = new Set(
    creep.room
      .find(FIND_MY_CREEPS)
      .filter((c) => c.memory.role === "courier" && c.id !== creep.id && c.memory.targetId)
      .map((c) => c.memory.targetId),
  );

  const harvester = creep.memory.targetId
    ? Game.getObjectById(creep.memory.targetId as Id<Creep>)
    : creep.pos.findClosestByPath(FIND_MY_CREEPS, {
        filter: (c) =>
          c.memory.role === "harvester" &&
          c.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity() * 0.5 &&
          !courierTargets.has(c.id),
      });

  if (!harvester) {
    creep.memory.targetId = undefined;
    return false;
  }

  const transferResult = harvester.transfer(creep, RESOURCE_ENERGY);

  switch (transferResult) {
    case OK:
      creep.memory.targetId = undefined;
      return true;

    case ERR_NOT_IN_RANGE:
      creep.memory.targetId = harvester.id;
      creep.moveTo(harvester, {
        visualizePathStyle: { stroke: "#ffaa00" },
        reusePath: 5,
      });
      return true;

    case ERR_NOT_ENOUGH_RESOURCES:
    default:
      creep.memory.targetId = undefined;
      return false;
  }
};

const deliverEnergyToSpawn = (creep: Creep): boolean => {
  const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS, {
    filter: (s) => s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
  });

  if (!spawn) return false;

  if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    creep.moveTo(spawn, { visualizePathStyle: { stroke: "#ffffff" } });
  }
  return true;
};

const deliverEnergyToExtensions = (creep: Creep): boolean => {
  const extension = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
  });

  if (!extension) return false;

  if (creep.transfer(extension, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    creep.moveTo(extension, { visualizePathStyle: { stroke: "#ffffff" } });
  }
  return true;
};

const deliverEnergyToBuilders = (creep: Creep): boolean => {
  const builder = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
    filter: (c) =>
      (c.memory.role === "builder" || c.memory.role === "upgrader") &&
      !c.memory.working &&
      c.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
  });

  if (!builder) return false;

  if (creep.transfer(builder, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    creep.moveTo(builder, { visualizePathStyle: { stroke: "#ffffff" } });
  }
  return true;
};

const deliverEnergyToStorage = (creep: Creep): boolean => {
  const storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_STORAGE && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
  });

  if (!storage) return false;

  if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffffff" } });
  }
  return true;
};
