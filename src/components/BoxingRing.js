import React, { useState, useEffect } from 'react';
import PlayerCard from './PlayerCard';

function BoxingRing({ 
  players, 
  playerNames, 
  gameActive, 
  gameEnded, 
  currentRound, 
  winner, 
  roundWinners, 
  pairings,
  availablePowerUps,
  activePowerUps,
  stunned,
  handleClick,
  setPowerUpToUse,
  startSecondRound,
  resetGame,
  styles
}) {
  // State to track which pairing is currently shown in the first round
  const [activePairingIndex, setActivePairingIndex] = useState(0);
  const [localGameActive, setLocalGameActive] = useState(gameActive);
  const [playerPowerUps, setPlayerPowerUps] = useState({});
  
  // Define power-ups data
  const powerUpsData = [
    { id: 'doubleDamage', name: 'Double Damage', emoji: '⚡', effect: 'Your punches do 2x damage!', duration: 5 },
    { id: 'heal', name: 'Healing', emoji: '❤️', effect: 'Recover 20% health!', duration: 0 },
    { id: 'shield', name: 'Shield', emoji: '🛡️', effect: 'Block 50% of incoming damage!', duration: 3 },
    { id: 'criticalHit', name: 'Critical Hit', emoji: '🔥', effect: 'Your next punch does 5x damage!', duration: 1 },
    { id: 'stun', name: 'Stun', emoji: '💫', effect: 'Opponent cannot attack for 2 seconds!', duration: 2 }
  ];
  
  // Update local state when props change
  useEffect(() => {
    setLocalGameActive(gameActive);
  }, [gameActive]);

  // Helper function to get opponent for a player
  const getOpponent = (playerId) => {
    if (!pairings.length) return null;
    const pairingWithPlayer = pairings.find(pair => pair.includes(playerId));
    if (!pairingWithPlayer) return null;
    const opponentId = pairingWithPlayer.find(id => id !== playerId);
    return players.find(p => p.id === opponentId);
  };

  // Check if player is in active match
  const isPlayerActive = (playerId) => {
    if (!pairings.length) return false;
    
    // In first round, only show the active pairing
    if (currentRound === 1 && pairings.length > 1) {
      return pairings[activePairingIndex].includes(playerId);
    }
    
    // In final round or when there's only one pairing, show all active pairings
    return pairings.some(pair => pair.includes(playerId));
  };

  // Check if player is stunned
  const isPlayerStunned = (playerId) => {
    return stunned[playerId] && stunned[playerId] > Date.now();
  };

  // Handle moving to the second semi-final
  const continueToSecondSemiFinal = () => {
    setActivePairingIndex(1);
    setLocalGameActive(true);
  };

  // Function to use a power-up
  const usePowerUp = (playerId, powerUpId) => {
    if (!localGameActive || gameEnded) return;
    
    // Find the power-up data
    const powerUp = powerUpsData.find(pu => pu.id === powerUpId);
    if (!powerUp) return;
    
    // Apply power-up effect based on type
    switch (powerUp.id) {
      case 'doubleDamage':
        setPlayerPowerUps(prev => ({
          ...prev,
          [playerId]: [...(prev[playerId] || []), {
            type: powerUp,
            endsAt: Date.now() + (powerUp.duration * 1000)
          }]
        }));
        // Call the parent component's function to set the power-up
        setPowerUpToUse(playerId);
        break;
      case 'heal':
        // Update player health in the parent component
        setPowerUpToUse(playerId);
        break;
      case 'shield':
        setPlayerPowerUps(prev => ({
          ...prev,
          [playerId]: [...(prev[playerId] || []), {
            type: powerUp,
            endsAt: Date.now() + (powerUp.duration * 1000)
          }]
        }));
        setPowerUpToUse(playerId);
        break;
      case 'criticalHit':
        setPlayerPowerUps(prev => ({
          ...prev,
          [playerId]: [...(prev[playerId] || []), {
            type: powerUp,
            endsAt: Date.now() + (powerUp.duration * 1000)
          }]
        }));
        setPowerUpToUse(playerId);
        break;
      case 'stun':
        // Find opponent and stun them
        const opponentId = getOpponent(playerId)?.id;
        if (opponentId) {
          // Update stunned state in the parent component
          setPowerUpToUse(playerId);
        }
        break;
      default:
        break;
    }
  };

  // PowerUpButton component
  const PowerUpButton = ({ playerId, powerUp }) => {
    return (
      <button
        style={styles.powerUpButton}
        onClick={() => usePowerUp(playerId, powerUp.id)}
        disabled={!localGameActive || gameEnded}
      >
        <div>{powerUp.emoji}</div>
        <div>{powerUp.name}</div>
        <small>{powerUp.effect}</small>
      </button>
    );
  };

  // Create players with reduced health
  const playersWithReducedHealth = players.map(player => ({
    ...player,
    health: player.health > 50 ? 50 : player.health // Ensure health doesn't exceed 50
  }));

  // Randomly assign power-ups to active players
  useEffect(() => {
    if (!localGameActive || gameEnded) return;
    
    const assignPowerUps = () => {
      // Get all active player IDs
      const activePlayerIds = playersWithReducedHealth
        .filter(player => isPlayerActive(player.id))
        .map(player => player.id);
      
      // For each active player, there's a 30% chance to get a power-up
      activePlayerIds.forEach(playerId => {
        if (Math.random() < 0.3 && !availablePowerUps[playerId]) {
          // Select a random power-up
          const randomPowerUpIndex = Math.floor(Math.random() * powerUpsData.length);
          const powerUp = powerUpsData[randomPowerUpIndex];
          
          // Update availablePowerUps in parent component
          if (setPowerUpToUse) {
            // This would normally update availablePowerUps, but we're simulating it here
            // In a real implementation, you'd call a function from props that updates availablePowerUps
          }
        }
      });
    };
    
    // Assign power-ups every 3 seconds
    const powerUpInterval = setInterval(assignPowerUps, 3000);
    
    return () => clearInterval(powerUpInterval);
  }, [localGameActive, gameEnded, availablePowerUps, playersWithReducedHealth]);

  // Determine if we're showing the "continue to second semi-final" button
  const showContinueButton = currentRound === 1 && 
                            roundWinners.length === 1 && 
                            !localGameActive && 
                            pairings.length > 1 && 
                            activePairingIndex === 0;

  // Determine if we're showing the "start championship final" button                          
  const showFinalButton = currentRound === 1 && 
                         roundWinners.length === 2 && 
                         !localGameActive;

  return (
    <div style={styles.boxingRing}>
      <div style={styles.ringRopes}></div>
      
      <div style={styles.roundBanner}>
        {currentRound === 1 ? 
          (pairings.length > 1 ? `SEMI-FINALS (Match ${activePairingIndex + 1} of 2)` : "SEMI-FINALS") : 
          "CHAMPIONSHIP FINAL"
        }
      </div>
      
      <div style={styles.playersContainer}>
        {playersWithReducedHealth.map(player => (
          isPlayerActive(player.id) && (
            <div key={player.id} style={styles.playerColumn}>
              <PlayerCard
                player={player}
                playerName={player.name}
                isActive={isPlayerActive(player.id)}
                isStunned={isPlayerStunned(player.id)}
                isWinner={winner === player.id}
                isChampion={currentRound === 2 && winner === player.id}
                advancesToFinal={currentRound === 1 && roundWinners.includes(player.id)}
                gameActive={localGameActive}
                availablePowerUp={availablePowerUps[player.id]}
                activePowerUps={activePowerUps[player.id] || []}
                opponentInfo={getOpponent(player.id) ? getOpponent(player.id).name : null}
                onPunchClick={handleClick}
                onUsePowerUp={setPowerUpToUse}
                currentRound={currentRound}
                styles={styles}
              />
              
              {/* Power-up section */}
              {localGameActive && !gameEnded && (
                <div style={styles.powerUpsSection}>
                  <h3 style={styles.powerUpsTitle}>Power-Ups</h3>
                  <div style={styles.powerUpsGrid}>
                    {powerUpsData.map((powerUp, index) => (
                      // Only show a power-up button with 40% probability to simulate randomness
                      Math.random() < 0.4 && (
                        <PowerUpButton 
                          key={index} 
                          playerId={player.id} 
                          powerUp={powerUp} 
                        />
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        ))}
      </div>
      
      {showContinueButton && (
        <div style={styles.gameResult}>
          <h2 style={styles.resultText}>
            First Semi-Final Complete!
          </h2>
          <p style={styles.finalistsText}>
            {players.find(p => p.id === roundWinners[0]).name} advances to the final!
          </p>
          <button 
            style={styles.advanceButton}
            onClick={continueToSecondSemiFinal}
          >
            Continue to Second Semi-Final
          </button>
        </div>
      )}
      
      {showFinalButton && (
        <div style={styles.gameResult}>
          <h2 style={styles.resultText}>
            Semi-Finals Complete!
          </h2>
          <p style={styles.finalistsText}>
            {players.find(p => p.id === roundWinners[0]).name} and {players.find(p => p.id === roundWinners[1]).name} advance to the final!
          </p>
          <button 
            style={styles.advanceButton}
            onClick={startSecondRound}
          >
            Start Championship Final!
          </button>
        </div>
      )}
      
      {currentRound === 2 && winner && (
        <div style={styles.gameResult}>
          <h2 style={styles.resultText}>
            {players.find(p => p.id === winner).name} is the Tournament Champion!
          </h2>
          <button 
            style={styles.resetButton}
            onClick={resetGame}
          >
            New Tournament
          </button>
        </div>
      )}
    </div>
  );
}

// Add new styles for power-ups
const powerUpStyles = {
  powerUpsSection: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  powerUpsTitle: {
    fontSize: '16px',
    marginBottom: '8px',
    color: '#333'
  },
  powerUpsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center'
  },
  powerUpButton: {
    padding: '8px',
    backgroundColor: '#e3f2fd',
    border: '2px solid #90caf9',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '12px',
    width: '80px',
    height: '80px',
    justifyContent: 'center'
  },
  playerColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 10px'
  }
};

export default BoxingRing;
