import React from 'react';
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
    return pairings.some(pair => pair.includes(playerId));
  };

  // Check if player is stunned
  const isPlayerStunned = (playerId) => {
    return stunned[playerId] && stunned[playerId] > Date.now();
  };

  return (
    <div style={styles.boxingRing}>
      <div style={styles.ringRopes}></div>
      
      <div style={styles.roundBanner}>
        {currentRound === 1 ? "SEMI-FINALS" : "CHAMPIONSHIP FINAL"}
      </div>
      
      <div style={styles.playersContainer}>
        {players.map(player => (
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
              gameActive={gameActive}
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
      
      {currentRound === 1 && roundWinners.length === 2 && !gameActive && (
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
