import React, { useState, useEffect } from 'react';

function DrinkingGame() {
  // Player data with health and clicks
  const initialPlayers = [
    { id: 1, name: "Player 1", emoji: "🦍", health: 100, clicks: 0 },
    { id: 2, name: "Player 2", emoji: "🦍", health: 100, clicks: 0 },
    { id: 3, name: "Player 3", emoji: "🦍", health: 100, clicks: 0 },
    { id: 4, name: "Player 4", emoji: "🦍", health: 100, clicks: 0 }
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
    
    // Create random pairings
    const shuffledPlayers = [...initialPlayers].sort(() => Math.random() - 0.5);
    const newPairings = [
      [shuffledPlayers[0].id, shuffledPlayers[1].id],
      [shuffledPlayers[2].id, shuffledPlayers[3].id]
    ];
    setPairings(newPairings);
    
    // Start countdown
    setGameEnded(false);
    setWinner(null);
    setCountdown(3);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle player clicks
  const handleClick = (playerId) => {
    if (!gameActive || gameEnded) return;
    
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
      
      // Update clicks and reduce opponent health
      player.clicks += 1;
      opponent.health = Math.max(0, opponent.health - 1);
      
      // Check for winner
      if (opponent.health <= 0 && !gameEnded) {
        setGameEnded(true);
        setGameActive(false);
        setWinner(player.id);
      }
      
      return updatedPlayers;
    });
  };

  // Reset the game
  const resetGame = () => {
    setPlayers(initialPlayers.map(player => ({
      ...player,
      health: 100,
      clicks: 0
    })));
    setGameActive(false);
    setGameEnded(false);
    setWinner(null);
  };

  // Get opponent for a player
  const getOpponent = (playerId) => {
    if (!pairings.length) return null;
    const pairingWithPlayer = pairings.find(pair => pair.includes(playerId));
    if (!pairingWithPlayer) return null;
    const opponentId = pairingWithPlayer.find(id => id !== playerId);
    return players.find(p => p.id === opponentId);
  };

  // Check if player is in semifinals or finals
  const isPlayerActive = (playerId) => {
    if (!pairings.length) return false;
    return pairings.some(pair => pair.includes(playerId));
  };

  // When game ends, find the winners and set up the final match
  useEffect(() => {
    if (gameEnded && pairings.length === 2 && !winner) {
      // First round ended, set up final match
      const winners = pairings.map(pair => {
        const player1 = players.find(p => p.id === pair[0]);
        const player2 = players.find(p => p.id === pair[1]);
        return player1.health <= 0 ? player2.id : player1.id;
      });
      
      // Reset for the final match
      setPairings([winners]);
      setPlayers(prevPlayers => 
        prevPlayers.map(player => ({
          ...player,
          health: 100,
          clicks: 0
        }))
      );
      setGameEnded(false);
    }
  }, [gameEnded, pairings, players, winner]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mad Gorilla Boxing 🦍👊</h1>
      
      {!gameActive && !gameEnded && countdown === 3 && (
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
            Start Boxing Match!
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
                  
                  {gameActive && (
                    <button 
                      style={styles.punchButton}
                      onClick={() => handleClick(player.id)}
                    >
                      PUNCH! 👊
                    </button>
                  )}
                  
                  {winner === player.id && (
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
          
          {gameEnded && winner && (
            <div style={styles.gameResult}>
              <h2 style={styles.resultText}>
                {playerNames[winner]} wins the boxing match!
              </h2>
              <button 
                style={styles.resetButton}
                onClick={resetGame}
              >
                New Match
              </button>
            </div>
          )}
        </div>
      )}
      
      <div style={styles.instructions}>
        <p>How to play:</p>
        <ol>
          <li>Name your gorillas</li>
          <li>Click "Start Boxing Match"</li>
          <li>When countdown ends, click the PUNCH button as fast as you can</li>
          <li>Deplete your opponent's health to win</li>
          <li>Winners advance to the championship!</li>
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
    marginBottom: '10px'
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
