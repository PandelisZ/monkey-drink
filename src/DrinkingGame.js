import React, { useState } from 'react';

function DrinkingGame() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [playerNames, setPlayerNames] = useState({
    1: "Player 1",
    2: "Player 2",
    3: "Player 3",
    4: "Player 4"
  });
  
  const players = [
    { id: 1, emoji: "🦍" },
    { id: 2, emoji: "🦍" },
    { id: 3, emoji: "🦍" },
    { id: 4, emoji: "🦍" }
  ];

  const handleNameChange = (id, newName) => {
    setPlayerNames(prevNames => ({
      ...prevNames,
      [id]: newName
    }));
  };

  const randomizePlayer = () => {
    if (spinning) return;
    
    setSpinning(true);
    
    // Simulate spinning effect by rapidly changing selection
    let counter = 0;
    const interval = setInterval(() => {
      setSelectedPlayer(Math.floor(Math.random() * 4) + 1);
      counter++;
      
      if (counter >= 10) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 150);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mad Gorilla Drinking Game 🦍🍻</h1>
      
      <div style={styles.playersContainer}>
        {players.map(player => (
          <div 
            key={player.id}
            style={{
              ...styles.playerCard,
              ...(selectedPlayer === player.id ? styles.selectedPlayer : {})
            }}
          >
            <div style={styles.emoji}>{player.emoji}</div>
            <input
              type="text"
              value={playerNames[player.id]}
              onChange={(e) => handleNameChange(player.id, e.target.value)}
              style={styles.nameInput}
              placeholder="Enter gorilla name"
            />
            {selectedPlayer === player.id && (
              <div style={styles.drinkMessage}>DRINK! 🍺</div>
            )}
          </div>
        ))}
      </div>
      
      <button 
        style={spinning ? styles.spinningButton : styles.spinButton} 
        onClick={randomizePlayer}
        disabled={spinning}
      >
        {spinning ? "Spinning..." : "Spin the Mad Gorilla! 🦍"}
      </button>
      
      <div style={styles.instructions}>
        <p>How to play:</p>
        <ol>
          <li>Gather 4 players and name your gorillas</li>
          <li>Press the "Spin" button</li>
          <li>The selected gorilla must drink!</li>
          <li>Repeat and enjoy responsibly 🍻</li>
        </ol>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
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
  selectedPlayer: {
    backgroundColor: '#ffdb58',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  },
  emoji: {
    fontSize: '50px',
    marginBottom: '10px'
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
  drinkMessage: {
    marginTop: '10px',
    fontWeight: 'bold',
    color: '#ff4500'
  },
  spinButton: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  },
  spinningButton: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#cccccc',
    color: '#666666',
    border: 'none',
    borderRadius: '5px',
    cursor: 'not-allowed'
  },
  instructions: {
    marginTop: '40px',
    textAlign: 'left',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px'
  }
};

export default DrinkingGame;
