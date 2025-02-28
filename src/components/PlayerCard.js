import React from 'react';
import PowerUpButton from './PowerUpButton';

function PlayerCard({ 
  player, 
  playerName, 
  isActive, 
  isStunned, 
  isWinner, 
  isChampion, 
  advancesToFinal,
  gameActive,
  availablePowerUp,
  activePowerUps,
  opponentInfo,
  onPunchClick,
  onUsePowerUp,
  currentRound,
  styles 
}) {
  if (!isActive) return null;

  // Get player's active power-ups for display
  const getPlayerActivePowerUps = () => {
    if (!activePowerUps) return [];
    const now = Date.now();
    return activePowerUps.filter(pu => pu.endsAt > now);
  };

  const activePlayerPowerUps = getPlayerActivePowerUps();

  return (
    <div 
      style={{
        ...styles.boxerCard,
        ...(isWinner ? styles.winnerCard : {}),
        ...(isStunned ? styles.stunnedCard : {})
      }}
    >
      <div style={styles.boxerTop}>
        <div style={styles.emoji}>{player.emoji}</div>
        <div style={styles.boxerName}>{playerName}</div>
        {isStunned && (
          <div style={styles.stunnedBadge}>STUNNED! 💫</div>
        )}
      </div>
      
      <div style={styles.healthBarContainer}>
        <div style={{
          ...styles.healthBar,
          width: `${player.health}%`,
          backgroundColor: player.health > 50 ? '#4CAF50' : 
                          player.health > 25 ? '#FFC107' : '#FF5722'
        }}></div>
        <span style={styles.healthText}>{player.health}%</span>
      </div>
      
      <div style={styles.clicksCounter}>
        Punches: {player.clicks}
      </div>
      
      {/* Active Power-ups Display */}
      {activePlayerPowerUps.length > 0 && (
        <div style={styles.activePowerUps}>
          {activePlayerPowerUps.map((powerUp, index) => (
            <div key={index} style={styles.activePowerUp}>
              {powerUp.type.emoji} {powerUp.type.name}
            </div>
          ))}
        </div>
      )}
      
      {/* Available Power-up */}
      <PowerUpButton 
        playerId={player.id} 
        availablePowerUp={availablePowerUp} 
        onUsePowerUp={onUsePowerUp}
        styles={styles}
      />
      
      {gameActive && (
        <button 
          style={{
            ...styles.punchButton,
            ...(isStunned ? styles.disabledButton : {})
          }}
          onClick={() => onPunchClick(player.id)}
          disabled={isStunned}
        >
          {isStunned ? "STUNNED!" : "PUNCH! 👊"}
        </button>
      )}
      
      {(currentRound === 1 && advancesToFinal) && (
        <div style={styles.winnerBadge}>ADVANCES TO FINAL! 🏆</div>
      )}
      
      {(currentRound === 2 && isChampion) && (
        <div style={styles.championBadge}>CHAMPION! 👑</div>
      )}
      
      {opponentInfo && (
        <div style={styles.vsContainer}>
          <span style={styles.vsText}>VS</span>
          <div style={styles.opponentInfo}>
            {opponentInfo}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerCard;
