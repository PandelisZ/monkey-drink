// PowerUp.js
// Defines power-up types, generation, and management functions

// Power-up types with their effects, durations, and display properties
export const POWER_UP_TYPES = {
  DOUBLE_DAMAGE: {
    id: 'double_damage',
    name: 'Double Damage',
    description: 'Your punches deal 2x damage!',
    duration: 5000, // 5 seconds
    icon: '💥',
    color: '#FF5722',
    effect: (damage) => damage * 2
  },
  SHIELD: {
    id: 'shield',
    name: 'Shield',
    description: 'Take 50% less damage!',
    duration: 4000, // 4 seconds
    icon: '🛡️',
    color: '#2196F3',
    effect: (damage) => Math.ceil(damage * 0.5)
  },
  HEALTH_BOOST: {
    id: 'health_boost',
    name: 'Health Boost',
    description: 'Instantly gain 15% health!',
    duration: 0, // Instant effect
    icon: '❤️',
    color: '#4CAF50',
    instantEffect: (health) => Math.min(100, health + 15) // Cap at 100
  },
  RAPID_FIRE: {
    id: 'rapid_fire',
    name: 'Rapid Fire',
    description: 'Click once, punch twice!',
    duration: 5000, // 5 seconds
    icon: '⚡',
    color: '#FFC107',
    clickMultiplier: 2
  },
  FREEZE: {
    id: 'freeze',
    name: 'Freeze',
    description: 'Opponent cannot attack for 3 seconds!',
    duration: 3000, // 3 seconds
    icon: '❄️',
    color: '#00BCD4',
    freezeOpponent: true
  }
};

// Get a random power-up from available types
export const getRandomPowerUp = () => {
  const powerUpKeys = Object.keys(POWER_UP_TYPES);
  const randomIndex = Math.floor(Math.random() * powerUpKeys.length);
  const powerUpKey = powerUpKeys[randomIndex];
  
  return {
    ...POWER_UP_TYPES[powerUpKey],
    id: POWER_UP_TYPES[powerUpKey].id,
    startTime: Date.now(),
    endTime: Date.now() + POWER_UP_TYPES[powerUpKey].duration
  };
};

// Create an interval that generates power-ups during gameplay
export const createPowerUpInterval = (callback, minInterval = 5000, maxInterval = 10000) => {
  // First power-up appears after a delay
  const initialDelay = Math.random() * (maxInterval - minInterval) + minInterval;
  
  // Set timeout for the first power-up
  const initialTimer = setTimeout(() => {
    // Generate the power-up
    const powerUp = getRandomPowerUp();
    
    // Call the callback with the power-up
    callback(powerUp);
    
    // Set up recurring interval with random timing
    const interval = setInterval(() => {
      // Generate a new power-up
      const newPowerUp = getRandomPowerUp();
      
      // Call the callback with the new power-up
      callback(newPowerUp);
      
      // Clear and reset the interval with a new random duration
      clearInterval(interval);
      createPowerUpInterval(callback, minInterval, maxInterval);
    }, Math.random() * (maxInterval - minInterval) + minInterval);
    
    // Store the interval ID for cleanup
    return interval;
  }, initialDelay);
  
  // Return the initial timer for cleanup
  return initialTimer;
};

// Check if a power-up is active (not expired)
export const isPowerUpActive = (powerUp) => {
  if (!powerUp) return false;
  return Date.now() < powerUp.endTime;
};

// Apply power-up effects to damage calculations
export const applyPowerUpEffects = (damage, playerPowerUps, targetPowerUps) => {
  let modifiedDamage = damage;
  
  // Apply attacker's power-ups that modify damage
  playerPowerUps.forEach(powerUp => {
    if (isPowerUpActive(powerUp)) {
      if (powerUp.effect) {
        modifiedDamage = powerUp.effect(modifiedDamage);
      }
    }
  });
  
  // Apply defender's power-ups that modify incoming damage
  targetPowerUps.forEach(powerUp => {
    if (isPowerUpActive(powerUp) && powerUp.id === 'shield') {
      modifiedDamage = powerUp.effect(modifiedDamage);
    }
  });
  
  // Check if defender is frozen
  const isTargetFrozen = targetPowerUps.some(
    powerUp => isPowerUpActive(powerUp) && powerUp.freezeOpponent
  );
  
  // If target is frozen, they take full damage
  if (isTargetFrozen) {
    return modifiedDamage;
  }
  
  return modifiedDamage;
};

// Generate a random position for power-up to appear in the ring
export const getRandomPosition = (containerWidth, containerHeight, elementWidth = 50, elementHeight = 50) => {
  // Ensure the power-up appears fully within the container
  const maxX = containerWidth - elementWidth;
  const maxY = containerHeight - elementHeight;
  
  return {
    left: Math.floor(Math.random() * maxX),
    top: Math.floor(Math.random() * maxY)
  };
};
