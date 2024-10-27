export const harvester = (creep: Creep) => {
  if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.working = false;
  }

  if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
  }

  if (creep.ticksToLive && creep.ticksToLive < 10) {
    creep.say("I'm dying");
    creep.drop(RESOURCE_ENERGY);
    return;
  }

  if (creep.store.getFreeCapacity() > 0) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES);

    if (!source) return;

    const harvest = creep.harvest(source);

    switch (harvest) {
      case ERR_NOT_IN_RANGE:
        creep.moveTo(source);
        break;
      default:
        break;
    }
  } else {
    if (!transferToNearbyStorage(creep)) {
      creep.say("I'm full");
    }
  }
};

const transferToNearbyStorage = (creep: Creep): boolean => {
  const storage = creep.pos.findInRange(FIND_STRUCTURES, 15, {
    filter: (structure) => {
      return (
        (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    },
  })[0];

  if (!storage) return false;

  const transferResult = creep.transfer(storage, RESOURCE_ENERGY);

  switch (transferResult) {
    case OK:
      return true;
    case ERR_FULL:
      return false;
    case ERR_NOT_IN_RANGE:
      creep.moveTo(storage);
      return true;
    default:
      return false;
  }
};
