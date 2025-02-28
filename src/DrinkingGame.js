import React, { useState, useEffect } from 'react';

function DrinkingGame() {
  // Player data with health and clicks
  const initialPlayers = [
    { id: 1, name: "Player 1", emoji: "🦍", health: 100, clicks: 0 },
    { id: 2, name: "Player 2", emoji: "🦍", health: 100, clicks: 0 },
    { id: 3, name: "Player 3", emoji: "🦍", health: 100, clicks: 0 },
    { id: 4, name: "Player 4", emoji: "🦍", health: 100, clicks: 0 }
  ];

  // Power-ups definitions
  const powerUpTypes = [
    { id: 'doubleDamage', name: 'Double Damage', emoji: '⚡', effect: 'Your punches do 2x damage!', duration: 5 },
    { id: 'heal', name: 'Healing', emoji: '❤️', effect: 'Recover 20% health!', duration: 0 },
    { id: 'shield', name: 'Shield', emoji: '🛡️', effect: 'Block 50% of incoming damage!', duration: 3 },
    { id: 'criticalHit', name: 'Critical Hit', emoji: '🔥', effect: 'Your next punch does 5x damage!', duration: 1 },
    { id: 'stun', name: 'Stun', emoji: '💫', effect: 'Opponent cannot attack for 2 seconds!', duration: 2 }
  ];

  // State variables
  const [players, setPlayers] = useState(initialPlayers);
  const [playerNames, setPlayerNames] = useState({
    1: "Player 1",
    2: "Player 2",
    3: "Player 3",
    4: "Player 4"
  });
  const [gameActive, setGameActive] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [pairings, setPairings] = useState([]);
  const [currentRound, setCurrentRound] = useState(0); // 0: not started, 1: first round, 2: final round
  const [roundWinners, setRoundWinners] = useState([]);
  const [activePowerUps, setActivePowerUps] = useState({}); // { playerId: [{type, endsAt}] }
  const [availablePowerUps, setAvailablePowerUps] = useState({}); // { playerId: powerUpType }
  const [powerUpTimer, setPowerUpTimer] = useState(null);
  const [stunned, setStunned] = useState({});
  const [powerUpToUse, setPowerUpToUse] = useState(null); // New state to track which power-up to use

  // Handle name change
  const handleNameChange = (id, newName) => {
    setPlayerNames(prevNames => ({
      ...prevNames,
      [id]: newName
    }));
  };

  // Start the boxing match
  const startGame = () => {
    // Reset player stats
    setPlayers(initialPlayers.map(player => ({
      ...player,
      health: 100,
      clicks: 0,
      name: playerNames[player.id]
    })));
    
    // Create random pairings for first round
    const shuffledPlayers = [...initialPlayers].sort(() => Math.random() - 0.5);
    const newPairings = [
      [shuffledPlayers[0].id, shuffledPlayers[1].id],
      [shuffledPlayers[2].id, shuffledPlayers[3].id]
    ];
    setPairings(newPairings);
    
    // Set up game state
    setGameEnded(false);
    setWinner(null);
    setCountdown(3);
    setCurrentRound(1);
    setRoundWinners([]);
    setActivePowerUps({});
    setAvailablePowerUps({});
    setStunned({});
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(true);
          // Start power-up generation
          startPowerUpGeneration();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start second round with winners from first round
  const startSecondRound = () => {
    if (roundWinners.length !== 2) return;
    
    // Reset health and clicks for the two finalists
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        health: roundWinners.includes(player.id) ? 100 : player.health,
        clicks: roundWinners.includes(player.id) ? 0 : player.clicks
      }))
    );
    
    // Set up final round pairing
    setPairings([roundWinners]);
    
    // Reset game state for new round
    setGameEnded(false);
    setWinner(null);
    setCountdown(3);
    setCurrentRound(2);
    setActivePowerUps({});
    setAvailablePowerUps({});
    setStunned({});
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(true);
          // Start power-up generation
          startPowerUpGeneration();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Generate random power-ups during the game
  const startPowerUpGeneration = () => {
    if (powerUpTimer) clearInterval(powerUpTimer);
    
    const timer = setInterval(() => {
      if (!gameActive || gameEnded) {
        clearInterval(timer);
        return;
      }
      
      // Get active players from current pairings
      const activePlayers = pairings.flat();
      
      // Randomly decide if a power-up should appear (30% chance)
      if (Math.random() < 0.3) {
        // Select a random player to receive power-up
        const randomPlayerIndex = Math.floor(Math.random() * activePlayers.length);
        const playerId = activePlayers[randomPlayerIndex];
        
        // Select a random power-up
        const randomPowerUpIndex = Math.floor(Math.random() * powerUpTypes.length);
        const powerUp = powerUpTypes[randomPowerUpIndex];
        
        // Make power-up available to player
        setAvailablePowerUps(prev => ({
          ...prev,
          [playerId]: powerUp
        }));
        
        // Auto-remove power-up after 5 seconds if not collected
        setTimeout(() => {
          setAvailablePowerUps(prev => {
            const newPowerUps = {...prev};
            if (newPowerUps[playerId] === powerUp) {
              delete newPowerUps[playerId];
            }
            return newPowerUps;
          });
        }, 5000);
      }
    }, 3000); // Generate power-up opportunity every 3 seconds
    
    setPowerUpTimer(timer);
  };

  // Use power-up effect hook - runs when powerUpToUse changes
  useEffect(() => {
    if (!powerUpToUse) return;
    
    const playerId = powerUpToUse;
    const powerUp = availablePowerUps[playerId];
    
    if (!powerUp) {
      setPowerUpToUse(null);
      return;
    }
    
    // Apply power-up effect based on type
    switch (powerUp.id) {
      case 'doubleDamage':
        setActivePowerUps(prev => ({
          ...prev,
          [playerId]: [...(prev[playerId] || []), {
            type: powerUp,
            endsAt: Date.now() + (powerUp.duration * 1000)
          }]
        }));
        break;
      case 'heal':
        setPlayers(prevPlayers => 
          prevPlayers.map(player => {
            if (player.id === playerId) {
              return {
                ...player,
                health: Math.min(100, player.health + 20)
              };
            }
            return player;
          })
        );
        break;
      case 'shield':
        setActivePowerUps(prev => ({
          ...prev,
          [playerId]: [...(prev[playerId] || []), {
            type: powerUp,
            endsAt: Date.now() + (powerUp.duration * 1000)
          }]
        }));
        break;
      case 'criticalHit':
        setActivePowerUps(prev => ({
          ...prev,
          [playerId]: [...(prev[playerId] || []), {
            type: powerUp,
            endsAt: Date.now() + (powerUp.duration * 1000)
          }]
        }));
        break;
      case 'stun':
        // Find opponent and stun them
        const opponentId = getOpponent(playerId)?.id;
        if (opponentId) {
          setStunned(prev => ({
            ...prev,
            [opponentId]: Date.now() + (powerUp.duration * 1000)
          }));
        }
        break;
      default:
        break;
    }
    
    // Remove the power-up from available list
    setAvailablePowerUps(prev => {
      const newPowerUps = {...prev};
      delete newPowerUps[playerId];
      return newPowerUps;
    });
    
    // Reset powerUpToUse after applying the effect
    setPowerUpToUse(null);
    
  }, [powerUpToUse, availablePowerUps]); // Dependencies for the effect

  // Calculate damage based on active power-ups
  const calculateDamage = (playerId) => {
    if (!activePowerUps[playerId]) return 1;
    
    let damage = 1;
    const now = Date.now();
    
    // Check for active power-ups and apply effects
    const activePowerUpsList = activePowerUps[playerId].filter(pu => pu.endsAt > now);
    
    activePowerUpsList.forEach(powerUp => {
      if (powerUp.type.id === 'doubleDamage') {
        damage *= 2;
      } else if (powerUp.type.id === 'criticalHit') {
        damage *= 5;
        // Remove critical hit after use
        setActivePowerUps(prev => ({
          ...prev,
          [playerId]: prev[playerId].filter(pu => pu !== powerUp)
        }));
      }
    });
    
    return damage;
  };

  // Calculate damage reduction based on active shields
  const calculateDamageReduction = (playerId) => {
    if (!activePowerUps[playerId]) return 1; // No reduction
    
    let damageMultiplier = 1;
    const now = Date.now();
    
    // Check for active shields
    const activeShields = activePowerUps[playerId].filter(
      pu => pu.endsAt > now && pu.type.id === 'shield'
    );
    
    if (activeShields.length > 0) {
      damageMultiplier = 0.5; // 50% damage reduction with shield
    }
    
    return damageMultiplier;
  };

  // Check and clean up expired power-ups
  useEffect(() => {
    if (!gameActive) return;
    
    const checkPowerUps = setInterval(() => {
      const now = Date.now();
      
      // Clean up expired power-ups
      setActivePowerUps(prev => {
        const newPowerUps = {};
        Object.keys(prev).forEach(playerId => {
          const activePowerUpsList = prev[playerId].filter(pu => pu.endsAt > now);
          if (activePowerUpsList.length > 0) {
            newPowerUps[playerId] = activePowerUpsList;
          }
        });
        return newPowerUps;
      });
      
      // Clean up expired stuns
      setStunned(prev => {
        const newStunned = {};
        Object.keys(prev).forEach(playerId => {
          if (prev[playerId] > now) {
            newStunned[playerId] = prev[playerId];
          }
        });
        return newStunned;
      });
    }, 500);
    
    return () => clearInterval(checkPowerUps);
  }, [gameActive]);

  // Handle player clicks
  const handleClick = (playerId) => {
    if (!gameActive || gameEnded) return;
    
    // Check if player is stunned
    if (stunned[playerId] && stunned[playerId] > Date.now()) {
      return; // Player is stunned, cannot attack
    }
    
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers];
      
      // Find the current player and their opponent
      const playerIndex = updatedPlayers.findIndex(p => p.id === playerId);
      const player = updatedPlayers[playerIndex];
      
      // Find opponent based on pairings
      const pairingWithPlayer = pairings.find(pair => pair.includes(playerId));
      const opponentId = pairingWithPlayer.find(id => id !== playerId);
      const opponentIndex = updatedPlayers.findIndex(p => p.id === opponentId);
      const opponent = updatedPlayers[opponentIndex];
      
      // Calculate damage based on power-ups
      const baseDamage = calculateDamage(playerId);
      
      // Apply damage reduction if opponent has a shield
      const damageMultiplier = calculateDamageReduction(opponentId);
      const finalDamage = Math.max(1, Math.floor(baseDamage * damageMultiplier));
      
      // Update clicks and reduce opponent health
      player.clicks += 1;
      opponent.health = Math.max(0, opponent.health - finalDamage);
      
      // Check for winner of this match
      if (opponent.health <= 0 && !gameEnded) {
        setGameEnded(true);
        setGameActive(false);
        
        if (currentRound === 1) {
          // Add winner to list for second round
          setRoundWinners(prev => [...prev, playerId]);
        } else if (currentRound === 2) {
          // Final winner
          setWinner(playerId);
        }
      }
      
      return updatedPlayers;
    });
  };

  // Reset the game completely
  const resetGame = () => {
    setPlayers(initialPlayers.map(player => ({
      ...player,
      health: 100,
      clicks: 0
    })));
    setGameActive(false);
    setGameEnded(false);
    setWinner(null);
    setCurrentRound(0);
    setRoundWinners([]);
    setPairings([]);
    setActivePowerUps({});
    setAvailablePowerUps({});
    if (powerUpTimer) clearInterval(powerUpTimer);
    setStunned({});
  };

  // Get opponent for a player
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

  // Check if first round is complete
  useEffect(() => {
    if (currentRound === 1 && gameEnded && roundWinners.length === 1) {
      // Check if the other match is still ongoing
      const otherPairing = pairings.find(pair => !pair.includes(roundWinners[0]));
      if (otherPairing) {
        const player1 = players.find(p => p.id === otherPairing[0]);
        const player2 = players.find(p => p.id === otherPairing[1]);
        
        if (player1.health <= 0) {
          setRoundWinners(prev => [...prev, player2.id]);
        } else if (player2.health <= 0) {
          setRoundWinners(prev => [...prev, player1.id]);
        }
      }
    }
  }, [currentRound, gameEnded, roundWinners, pairings, players]);

  // When both first round matches are complete, prepare for second round
  useEffect(() => {
    if (currentRound === 1 && roundWinners.length === 2 && gameEnded) {
      // Set timeout to allow users to see the results before starting next round
      setTimeout(() => {
        setGameActive(false);
        setGameEnded(false);
      }, 2000);
    }
  }, [currentRound, roundWinners, gameEnded]);

  // Get player's active power-ups for display
  const getPlayerActivePowerUps = (playerId) => {
    if (!activePowerUps[playerId]) return [];
    const now = Date.now();
    return activePowerUps[playerId].filter(pu => pu.endsAt > now);
  };

  // Check if player is stunned
  const isPlayerStunned = (playerId) => {
    return stunned[playerId] && stunned[playerId] > Date.now();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mad Gorilla Boxing Tournament 🦍👊</h1>
      
      {currentRound === 0 && (
        <div style={styles.setupSection}>
          <div style={styles.playersContainer}>
            {players.map(player => (
              <div 
                key={player.id}
                style={styles.playerCard}
              >
                <div style={styles.emoji}>{player.emoji}</div>
                <input
                  type="text"
                  value={playerNames[player.id]}
                  onChange={(e) => handleNameChange(player.id, e.target.value)}
                  style={styles.nameInput}
                  placeholder="Enter gorilla name"
                />
              </div>
            ))}
          </div>
          
          <button 
            style={styles.startButton} 
            onClick={startGame}
          >
            Start Tournament!
          </button>
        </div>
      )}
      
      {countdown > 0 && countdown < 3 && (
        <div style={styles.countdownContainer}>
          <h2 style={styles.countdown}>Get Ready: {countdown}</h2>
        </div>
      )}
      
      {(gameActive || gameEnded) && (
        <div style={styles.boxingRing}>
          <div style={styles.ringRopes}></div>
          
          <div style={styles.roundBanner}>
            {currentRound === 1 ? "SEMI-FINALS" : "CHAMPIONSHIP FINAL"}
          </div>
          
          <div style={styles.playersContainer}>
            {players.map(player => (
              isPlayerActive(player.id) && (
                <div 
                  key={player.id}
                  style={{
                    ...styles.boxerCard,
                    ...(winner === player.id ? styles.winnerCard : {}),
                    ...(isPlayerStunned(player.id) ? styles.stunnedCard : {})
                  }}
                >
                  <div style={styles.boxerTop}>
                    <div style={styles.emoji}>{player.emoji}</div>
                    <div style={styles.boxerName}>{playerNames[player.id]}</div>
                    {isPlayerStunned(player.id) && (
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
                  {getPlayerActivePowerUps(player.id).length > 0 && (
                    <div style={styles.activePowerUps}>
                      {getPlayerActivePowerUps(player.id).map((powerUp, index) => (
                        <div key={index} style={styles.activePowerUp}>
                          {powerUp.type.emoji} {powerUp.type.name}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Available Power-up */}
                  {availablePowerUps[player.id] && (
                    <div style={styles.availablePowerUp}>
                      <div style={styles.powerUpInfo}>
                        {availablePowerUps[player.id].emoji} {availablePowerUps[player.id].name}
                        <div style={styles.powerUpEffect}>{availablePowerUps[player.id].effect}</div>
                      </div>
                      <button 
                        style={styles.powerUpButton}
                        onClick={() => setPowerUpToUse(player.id)}
                      >
                        Use Power-up!
                      </button>
                    </div>
                  )}
                  
                  {gameActive && (
                    <button 
                      style={{
                        ...styles.punchButton,
                        ...(isPlayerStunned(player.id) ? styles.disabledButton : {})
                      }}
                      onClick={() => handleClick(player.id)}
                      disabled={isPlayerStunned(player.id)}
                    >
                      {isPlayerStunned(player.id) ? "STUNNED!" : "PUNCH! 👊"}
                    </button>
                  )}
                  
                  {(currentRound === 1 && roundWinners.includes(player.id)) && (
                    <div style={styles.winnerBadge}>ADVANCES TO FINAL! 🏆</div>
                  )}
                  
                  {(currentRound === 2 && winner === player.id) && (
                    <div style={styles.championBadge}>CHAMPION! 👑</div>
                  )}
                  
                  {getOpponent(player.id) && (
                    <div style={styles.vsContainer}>
                      <span style={styles.vsText}>VS</span>
                      <div style={styles.opponentInfo}>
                        {playerNames[getOpponent(player.id).id]}
                      </div>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
          
          {currentRound === 1 && roundWinners.length === 2 && !gameActive && (
            <div style={styles.gameResult}>
              <h2 style={styles.resultText}>
                Semi-Finals Complete!
              </h2>
              <p style={styles.finalistsText}>
                {playerNames[roundWinners[0]]} and {playerNames[roundWinners[1]]} advance to the final!
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
                {playerNames[winner]} is the Tournament Champion!
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
      )}
      
      <div style={styles.instructions}>
        <p>How to play:</p>
        <ol>
          <li>Name your gorillas</li>
          <li>Click "Start Tournament" for 2v2 semi-finals</li>
          <li>Click the PUNCH button as fast as you can</li>
          <li>Collect and use power-ups to gain advantages</li>
          <li>Winners from each semi-final advance to the championship!</li>
        </ol>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  },
  title: {
    color: '#333',
    marginBottom: '30px'
  },
  setupSection: {
    marginBottom: '30px'
  },
  playersContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '30px'
  },
  playerCard: {
    width: '150px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },
  boxingRing: {
    position: 'relative',
    backgroundColor: '#8B4513',
    borderRadius: '10px',
    padding: '40px 20px',
    marginBottom: '30px',
    border: '15px solid #A0522D',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)',
    overflow: 'hidden'
  },
  ringRopes: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    borderTop: '6px solid #FFD700',
    borderBottom: '6px solid #FFD700',
    pointerEvents: 'none',
    zIndex: 1
  },
  roundBanner: {
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#FFD700',
    color: '#333',
    padding: '5px 20px',
    borderRadius: '15px',
    fontWeight: 'bold',
    fontSize: '18px',
    zIndex: 3,
    boxShadow: '0 3px 5px rgba(0,0,0,0.3)'
  },
  boxerCard: {
    width: '200px',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 2
  },
  winnerCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    boxShadow: '0 5px 20px rgba(255, 215, 0, 0.5)'
  },
  stunnedCard: {
    backgroundColor: 'rgba(200, 200, 200, 0.8)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
  },
  boxerTop: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '10px',
    position: 'relative'
  },
  boxerName: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '10px 0'
  },
  emoji: {
    fontSize: '60px',
    marginBottom: '10px'
  },
  healthBarContainer: {
    width: '100%',
    height: '20px',
    backgroundColor: '#e0e0e0',
    borderRadius: '10px',
    margin: '10px 0',
    position: 'relative',
    overflow: 'hidden'
  },
  healthBar: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease'
  },
  healthText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '12px',
    textShadow: '0 0 3px #fff'
  },
  clicksCounter: {
    fontSize: '14px',
    marginBottom: '10px'
  },
  activePowerUps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginBottom: '10px'
  },
  activePowerUp: {
    padding: '5px',
    fontSize: '12px',
    backgroundColor: '#e8f5e9',
    borderRadius: '5px',
    fontWeight: 'bold'
  },
  availablePowerUp: {
    backgroundColor: '#e3f2fd',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px',
    border: '2px dashed #2196F3'
  },
  powerUpInfo: {
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  powerUpEffect: {
    fontSize: '12px',
    color: '#555',
    marginTop: '3px'
  },
  powerUpButton: {
    padding: '8px 12px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  punchButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
    boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
    transition: 'all 0.1s ease'
  },
  disabledButton: {
    backgroundColor: '#9e9e9e',
    cursor: 'not-allowed'
  },
  winnerBadge: {
    position: 'absolute',
    top: '-15px',
    right: '-15px',
    backgroundColor: '#FFD700',
    color: '#333',
    padding: '5px 10px',
    borderRadius: '20px',
    fontWeight: 'bold',
    boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
    zIndex: 3
  },
  championBadge: {
    position: 'absolute',
    top: '-15px',
    right: '-15px',
    backgroundColor: '#FFD700',
    color: '#333',
    padding: '5px 10px',
    borderRadius: '20px',
    fontWeight: 'bold',
    boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
    zIndex: 3
  },
  stunnedBadge: {
    padding: '5px 10px',
    backgroundColor: '#9e9e9e',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginTop: '5px'
  },
  vsContainer: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  vsText: {
    fontWeight: 'bold',
    color: '#d32f2f',
    fontSize: '24px',
    marginBottom: '5px'
  },
  opponentInfo: {
    fontStyle: 'italic',
    fontSize: '14px'
  },
  nameInput: {
    width: '90%',
    padding: '8px',
    margin: '5px 0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center'
  },
  startButton: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
  },
  resetButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
  },
  advanceButton: {
    padding: '12px 25px',
    fontSize: '16px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
    fontWeight: 'bold'
  },
  gameResult: {
    marginTop: '30px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
  },
  resultText: {
    color: '#333',
    marginBottom: '10px'
  },
  finalistsText: {
    fontSize: '16px',
    color: '#444'
  },
  countdownContainer: {
    margin: '30px 0',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '30px',
    borderRadius: '8px'
  },
  countdown: {
    color: '#fff',
    fontSize: '36px'
  },
  instructions: {
    marginTop: '40px',
    textAlign: 'left',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  }
};

export default DrinkingGame;
