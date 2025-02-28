import React, { useState, useEffect, useRef } from 'react';
import { 
  getRandomPowerUp, 
  createPowerUpInterval, 
  isPowerUpActive, 
  applyPowerUpEffects, 
  getRandomPosition 
} from './PowerUp';

function DrinkingGame() {
  // References
  const boxingRingRef = useRef(null);
  
  // Game state
  const [round, setRound] = useState(1);
  const [gameStage, setGameStage] = useState('setup'); // 'setup', 'countdown', 'playing', 'roundEnd', 'gameEnd'
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState(null);
  const [finalists, setFinalists] = useState([]);
  const [roundWinners, setRoundWinners] = useState([]);
  
  // Player data
  const initialPlayers = [
    { id: 1, emoji: "🦍", health: 100, clicks: 0 },
    { id: 2, emoji: "🦍", health: 100, clicks: 0 },
    { id: 3, emoji: "🦍", health: 100, clicks: 0 },
    { id: 4, emoji: "🦍", health: 100, clicks: 0 }
  ];
  
  const [players, setPlayers] = useState(initialPlayers);
  const [playerNames, setPlayerNames] = useState({
    1: "Player 1",
    2: "Player 2",
    3: "Player 3",
    4: "Player 4"
  });
  const [pairings, setPairings] = useState([]);
  
  // Power-up state
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [playerPowerUps, setPlayerPowerUps] = useState({
    1: [], 2: [], 3: [], 4: []
  });
  const [powerUpInterval, setPowerUpInterval] = useState(null);
  
  // Handle name change
  const handleNameChange = (id, newName) => {
    setPlayerNames(prevNames => ({
      ...prevNames,
      [id]: newName
    }));
  };
  
  // Start the game
  const startGame = () => {
    // Reset player states
    setPlayers(initialPlayers.map(player => ({
      ...player,
      health: 100,
      clicks: 0
    })));
    
    // Reset game state
    setRound(1);
    setWinner(null);
    setRoundWinners([]);
    setFinalists([]);
    setPlayerPowerUps({
      1: [], 2: [], 3: [], 4: []
    });
    
    // Create random pairings for round 1
    const shuffledPlayerIds = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
    const newPairings = [
      [shuffledPlayerIds[0], shuffledPlayerIds[1]],
      [shuffledPlayerIds[2], shuffledPlayerIds[3]]
    ];
    setPairings(newPairings);
    
    // Start countdown
    setGameStage('countdown');
    setCountdown(3);
    
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameStage('playing');
          startPowerUpGeneration();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Start round 2 (final)
  const startRound2 = () => {
    // Reset players for round 2
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        health: 100,
        clicks: 0
      }))
    );
    
    // Clear all power-ups
    setActivePowerUps([]);
    setPlayerPowerUps({
      1: [], 2: [], 3: [], 4: []
    });
    
    // Set up final match
    setPairings([[roundWinners[0], roundWinners[1]]]);
    setRound(2);
    
    // Start countdown
    setGameStage('countdown');
    setCountdown(3);
    
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameStage('playing');
          startPowerUpGeneration();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Generate power-ups
  const startPowerUpGeneration = () => {
    // Clear any existing interval
    if (powerUpInterval) {
      clearInterval(powerUpInterval);
    }
    
    // Start a new interval for power-up generation
    const interval = createPowerUpInterval((powerUp) => {
      if (gameStage === 'playing' && boxingRingRef.current) {
        // Get random position within boxing ring
        const ringRect = boxingRingRef.current.getBoundingClientRect();
        const position = getRandomPosition(ringRect.width, ringRect.height, 60, 60);
        
        // Add the new power-up to the active list
        setActivePowerUps(prev => [
          ...prev, 
          { 
            ...powerUp, 
            position, 
            collected: false,
            id: `${powerUp.id}-${Date.now()}`
          }
        ]);
        
        // Remove the power-up after 5 seconds if not collected
        setTimeout(() => {
          setActivePowerUps(prev => 
            prev.filter(p => p.id !== `${powerUp.id}-${Date.now()}`)
          );
        }, 5000);
      }
    });
    
    setPowerUpInterval(interval);
  };
  
  // Collect a power-up
  const collectPowerUp = (powerUpId, playerId) => {
    setActivePowerUps(prev => {
      const updatedPowerUps = prev.map(p => 
        p.id === powerUpId ? { ...p, collected: true } : p
      );
      
      // Find the collected power-up
      const collectedPowerUp = prev.find(p => p.id === powerUpId);
      
      // Apply the power-up to the player
      if (collectedPowerUp) {
        setPlayerPowerUps(prevPlayerPowerUps => {
          const updatedPlayerPowerUps = { ...prevPlayerPowerUps };
          
          // Add the power-up to the player's list
          updatedPlayerPowerUps[playerId] = [
            ...updatedPlayerPowerUps[playerId],
            { 
              ...collectedPowerUp,
              startTime: Date.now(),
              endTime: Date.now() + collectedPowerUp.duration
            }
          ];
          
          // Apply instant effects if any
          if (collectedPowerUp.instantEffect) {
            setPlayers(prevPlayers => {
              return prevPlayers.map(player => {
                if (player.id === playerId) {
                  return {
                    ...player,
                    health: collectedPowerUp.instantEffect(player.health)
                  };
                }
                return player;
              });
            });
          }
          
          return updatedPlayerPowerUps;
        });
      }
      
      // Remove the collected power-up from display
      return updatedPowerUps.filter(p => p.id !== powerUpId);
    });
  };
  
  // Handle player clicks
  const handleClick = (playerId) => {
    if (gameStage !== 'playing') return;
    
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers];
      
      // Find the current player and their opponent
      const playerIndex = updatedPlayers.findIndex(p => p.id === playerId);
      const player = updatedPlayers[playerIndex];
      
      // Find opponent based on pairings
      const currentPairing = pairings.find(pair => pair.includes(playerId));
      if (!currentPairing) return updatedPlayers;
      
      const opponentId = currentPairing.find(id => id !== playerId);
      const opponentIndex = updatedPlayers.findIndex(p => p.id === opponentId);
      const opponent = updatedPlayers[opponentIndex];
      
      // Check if player is frozen by opponent's power-up
      const playerPowerUpsArray = playerPowerUps[playerId] || [];
      const opponentPowerUpsArray = playerPowerUps[opponentId] || [];
      
      const isPlayerFrozen = opponentPowerUpsArray.some(
        powerUp => isPowerUpActive(powerUp) && powerUp.freezeOpponent
      );
      
      if (isPlayerFrozen) {
        // Player is frozen and cannot punch
        return updatedPlayers;
      }
      
      // Calculate base damage
      let baseDamage = 1;
      
      // Apply rapid fire multiplier if active
      const hasRapidFire = playerPowerUpsArray.some(
        powerUp => isPowerUpActive(powerUp) && powerUp.clickMultiplier
      );
      
      // Determine number of clicks to register
      let clicksToAdd = 1;
      if (hasRapidFire) {
        const rapidFirePowerUp = playerPowerUpsArray.find(
          powerUp => isPowerUpActive(powerUp) && powerUp.clickMultiplier
        );
        clicksToAdd = rapidFirePowerUp ? rapidFirePowerUp.clickMultiplier : 1;
      }
      
      // Update player clicks
      player.clicks += clicksToAdd;
      
      // Apply power-up effects to damage
      const totalDamage = applyPowerUpEffects(
        baseDamage * clicksToAdd, 
        playerPowerUpsArray, 
        opponentPowerUpsArray
      );
      
      // Reduce opponent health
      opponent.health = Math.max(0, opponent.health - totalDamage);
      
      // Check for round winner
      if (opponent.health <= 0) {
        // Stop power-up generation
        if (powerUpInterval) {
          clearInterval(powerUpInterval);
          setPowerUpInterval(null);
        }
        
        if (round === 1) {
          // Store winner for round 1
          setRoundWinners(prev => [...prev, playerId]);
          
          // Check if both matches of round 1 are completed
          if (roundWinners.length === 1 || prev.length === 1) {
            setGameStage('roundEnd');
          }
        } else {
          // Final round winner
          setWinner(playerId);
          setGameStage('gameEnd');
        }
      }
      
      return updatedPlayers;
    });
  };
  
  // Reset the entire game
  const resetGame = () => {
    // Clear power-up generation
    if (powerUpInterval) {
      clearInterval(powerUpInterval);
      setPowerUpInterval(null);
    }
    
    // Reset all states
    setPlayers(initialPlayers);
    setActivePowerUps([]);
    setPlayerPowerUps({
      1: [], 2: [], 3: [], 4: []
    });
    setRound(1);
    setWinner(null);
    setRoundWinners([]);
    setFinalists([]);
    setGameStage('setup');
  };
  
  // Clean up power-ups on component unmount
  useEffect(() => {
    return () => {
      if (powerUpInterval) {
        clearInterval(powerUpInterval);
      }
    };
  }, [powerUpInterval]);
  
  // Process when round 1 ends
  useEffect(() => {
    if (roundWinners.length === 2 && gameStage === 'roundEnd') {
      // Prepare for round 2
      setFinalists(roundWinners);
    }
  }, [roundWinners, gameStage]);
  
  // Get opponent for a player
  const getOpponent = (playerId) => {
    const currentPairing = pairings.find(pair => pair.includes(playerId));
    if (!currentPairing) return null;
    
    const opponentId = currentPairing.find(id => id !== playerId);
    return players.find(p => p.id === opponentId);
  };
  
  // Check if player is active in current round
  const isPlayerActive = (playerId) => {
    if (!pairings.length) return false;
    return pairings.some(pair => pair.includes(playerId));
  };
  
  // Render active power-ups in the ring
  const renderActivePowerUps = () => {
    return activePowerUps.map(powerUp => (
      <div 
        key={powerUp.id}
        style={{
          ...styles.powerUpItem,
          left: `${powerUp.position.left}px`,
          top: `${powerUp.position.top}px`,
          backgroundColor: powerUp.color
        }}
        onClick={() => {
          // When clicked, assign to nearest player
          const activePlayers = pairings.flat();
          if (activePlayers.length > 0) {
            // For simplicity, randomly assign to one of the active players
            const randomPlayerIndex = Math.floor(Math.random() * activePlayers.length);
            collectPowerUp(powerUp.id, activePlayers[randomPlayerIndex]);
          }
        }}
      >
        <div style={styles.powerUpIcon}>{powerUp.icon}</div>
      </div>
    ));
  };
  
  // Render power-ups for a player
  const renderPlayerPowerUps = (playerId) => {
    const playerActivePowerUps = playerPowerUps[playerId] || [];
    const activePowerUpsList = playerActivePowerUps.filter(isPowerUpActive);
    
    if (activePowerUpsList.length === 0) return null;
    
    return (
      <div style={styles.playerPowerUps}>
        {activePowerUpsList.map((powerUp, index) => (
          <div 
            key={`${playerId}-${powerUp.id}-${index}`}
            style={{
              ...styles.playerPowerUpItem,
              backgroundColor: powerUp.color
            }}
            title={powerUp.description}
          >
            <span>{powerUp.icon}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mad Gorilla Boxing 🦍👊</h1>
      
      {/* Setup screen */}
      {gameStage === 'setup' && (
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
            Start 2v2 Boxing Tournament
          </button>
          
          <div style={styles.instructions}>
            <p>How to play:</p>
            <ol>
              <li>Name your gorillas</li>
              <li>Two 2v2 matches will be played (Round 1)</li>
              <li>Winners face off in the championship (Round 2)</li>
              <li>Click rapidly to punch your opponent</li>
              <li>Collect power-ups that appear in the ring!</li>
              <li>First to deplete opponent's health wins</li>
            </ol>
          </div>
        </div>
      )}
      
      {/* Countdown screen */}
      {gameStage === 'countdown' && (
        <div style={styles.countdownContainer}>
          <h2 style={styles.roundTitle}>Round {round}</h2>
          <h2 style={styles.countdown}>{countdown}</h2>
        </div>
      )}
      
      {/* Active gameplay */}
      {(gameStage === 'playing' || gameStage === 'roundEnd' || gameStage === 'gameEnd') && (
        <div style={styles.boxingRing} ref={boxingRingRef}>
          <div style={styles.ringRopes}></div>
          
          {/* Round indicator */}
          <div style={styles.roundIndicator}>
            Round {round}: {round === 1 ? 'Semi-Finals' : 'Championship'}
          </div>
          
          {/* Power-ups in the ring */}
          {gameStage === 'playing' && renderActivePowerUps()}
          
          {/* Players */}
          <div style={styles.playersContainer}>
            {players.map(player => (
              isPlayerActive(player.id) && (
                <div 
                  key={player.id}
                  style={{
                    ...styles.boxerCard,
                    ...(winner === player.id ? styles.winnerCard : {})
                  }}
                >
                  <div style={styles.boxerTop}>
                    <div style={styles.emoji}>{player.emoji}</div>
                    <div style={styles.boxerName}>{playerNames[player.id]}</div>
                    
                    {/* Player's active power-ups */}
                    {renderPlayerPowerUps(player.id)}
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
                  
                  {gameStage === 'playing' && (
                    <button 
                      style={styles.punchButton}
                      onClick={() => handleClick(player.id)}
                    >
                      PUNCH! 👊
                    </button>
                  )}
                  
                  {(((gameStage === 'roundEnd' && roundWinners.includes(player.id)) || 
                     (gameStage === 'gameEnd' && winner === player.id))) && (
                    <div style={styles.winnerBadge}>WINNER! 🏆</div>
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
          
          {/* Round 1 completion screen */}
          {gameStage === 'roundEnd' && roundWinners.length === 2 && (
            <div style={styles.gameResult}>
              <h2 style={styles.resultText}>
                Semi-Finals Complete!
              </h2>
              <p>
                {playerNames[roundWinners[0]]} and {playerNames[roundWinners[1]]} advance to the championship!
              </p>
              <button 
                style={styles.continueButton}
                onClick={startRound2}
              >
                Start Championship Round
              </button>
            </div>
          )}
          
          {/* Game end screen */}
          {gameStage === 'gameEnd' && winner && (
            <div style={styles.gameResult}>
              <h2 style={styles.resultText}>
                🏆 Tournament Champion 🏆
              </h2>
              <p style={styles.championText}>
                {playerNames[winner]} is the Mad Gorilla Boxing Champion!
              </p>
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
    overflow: 'hidden',
    minHeight: '500px'
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
  roundIndicator: {
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    padding: '5px 15px',
    borderRadius: '20px',
    fontWeight: 'bold',
    zIndex: 5
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
  continueButton: {
    padding: '12px 25px',
    fontSize: '16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
  },
  resetButton: {
    padding: '12px 25px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
  },
  gameResult: {
    marginTop: '30px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    zIndex: 5,
    position: 'relative'
  },
  resultText: {
    color: '#333',
    marginBottom: '10px'
  },
  championText: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '15px 0'
  },
  countdownContainer: {
    margin: '30px 0',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '30px',
    borderRadius: '8px'
  },
  roundTitle: {
    color: '#FFD700',
    marginBottom: '15px'
  },
  countdown: {
    color: '#fff',
    fontSize: '60px'
  },
  instructions: {
    marginTop: '40px',
    textAlign: 'left',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  powerUpItem: {
    position: 'absolute',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: 10,
    animation: 'pulse 1.5s infinite ease-in-out',
    boxShadow: '0 0 15px rgba(255,255,255,0.7)',
    transition: 'transform 0.2s ease'
  },
  powerUpIcon: {
    fontSize: '24px'
  },
  playerPowerUps: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '5px',
    gap: '5px'
  },
  playerPowerUpItem: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '14px'
  }
};

export default DrinkingGame;
