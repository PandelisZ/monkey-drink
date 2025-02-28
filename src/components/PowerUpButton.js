import React from 'react';

function PowerUpButton({ playerId, availablePowerUp, onUsePowerUp, styles }) {
  if (!availablePowerUp) return null;

  return (
    <div style={styles.availablePowerUp}>
      <div style={styles.powerUpInfo}>
        {availablePowerUp.emoji} {availablePowerUp.name}
        <div style={styles.powerUpEffect}>{availablePowerUp.effect}</div>
      </div>
      <button 
        style={styles.powerUpButton}
        onClick={() => onUsePowerUp(playerId)}
      >
        Use Power-up!
      </button>
    </div>
  );
}

export default PowerUpButton;
