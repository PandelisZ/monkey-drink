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

  // Create players with reduced health
  const playersWithReducedHealth = players.map(player => ({
    ...player,
    health: player.health > 50 ? 50 : player.health // Ensure health doesn't exceed 50
  }));

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
            <PlayerCard
              key={player.id}
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

export default BoxingRing;
