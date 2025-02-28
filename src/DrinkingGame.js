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
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState(null); // 'correct', 'incorrect', or null
  
  const players = [
    { id: 1, emoji: "🦍" },
    { id: 2, emoji: "🦍" },
    { id: 3, emoji: "🦍" },
    { id: 4, emoji: "🦍" }
  ];

  const questions = [
    { 
      question: "Where did Sam and Emily have their first date?", 
      answer: "Italian restaurant" 
    },
    { 
      question: "What is Emily's favorite color that Sam always forgets?", 
      answer: "Purple" 
    },
    { 
      question: "What's the name of Sam and Emily's pet?", 
      answer: "Whiskers" 
    },
    { 
      question: "What anniversary gift did Sam forget last year?", 
      answer: "Flowers" 
    },
    { 
      question: "What food does Emily hate that Sam keeps cooking?", 
      answer: "Brussels sprouts" 
    },
    { 
      question: "Where are Sam and Emily planning their next vacation?", 
      answer: "Hawaii" 
    },
    { 
      question: "What TV show do Sam and Emily always argue about?", 
      answer: "Game of Thrones" 
    },
    { 
      question: "What embarrassing nickname does Emily call Sam?", 
      answer: "Sammy Bear" 
    },
    { 
      question: "What did Sam break of Emily's that he tried to hide?", 
      answer: "Favorite mug" 
    },
    { 
      question: "How many times has Sam been late to date night in the past month?", 
      answer: "Three" 
    }
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
    setShowQuestion(false);
    setAnswerResult(null);
    setPlayerAnswer('');
    
    // Simulate spinning effect but always land on player 3
    let counter = 0;
    const interval = setInterval(() => {
      // During animation, show different players for visual effect
      setSelectedPlayer(Math.floor(Math.random() * 4) + 1);
      counter++;
      
      if (counter >= 10) {
        clearInterval(interval);
        // Always select player 3 at the end
        setSelectedPlayer(3);
        setSpinning(false);
        
        // Select a random question
        const randomQuestionIndex = Math.floor(Math.random() * questions.length);
        setCurrentQuestion(questions[randomQuestionIndex]);
        setShowQuestion(true);
      }
    }, 150);
  };

  const handleAnswerSubmit = () => {
    if (!currentQuestion) return;
    
    // Compare answer (case insensitive)
    if (playerAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()) {
      setAnswerResult('correct');
    } else {
      setAnswerResult('incorrect');
    }
  };

  const resetQuestion = () => {
    setShowQuestion(false);
    setCurrentQuestion(null);
    setPlayerAnswer('');
    setAnswerResult(null);
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
            {selectedPlayer === player.id && !showQuestion && !answerResult && (
              <div style={styles.selectionMessage}>Selected!</div>
            )}
            {selectedPlayer === player.id && answerResult === 'correct' && (
              <div style={styles.correctMessage}>Correct! You're safe! 🎉</div>
            )}
            {selectedPlayer === player.id && answerResult === 'incorrect' && (
              <div style={styles.drinkMessage}>WRONG! DRINK! 🍺</div>
            )}
          </div>
        ))}
      </div>
      
      {showQuestion && selectedPlayer && currentQuestion && (
        <div style={styles.questionContainer}>
          <h3 style={styles.questionTitle}>
            Question for {playerNames[selectedPlayer]}:
          </h3>
          <p style={styles.questionText}>{currentQuestion.question}</p>
          {!answerResult && (
            <>
              <input 
                type="text" 
                value={playerAnswer}
                onChange={(e) => setPlayerAnswer(e.target.value)}
                style={styles.answerInput}
                placeholder="Your answer..."
              />
              <button 
                onClick={handleAnswerSubmit}
                style={styles.answerButton}
              >
                Submit Answer
              </button>
            </>
          )}
          {answerResult && (
            <button 
              onClick={resetQuestion}
              style={styles.nextButton}
            >
              Next Round
            </button>
          )}
        </div>
      )}
      
      <button 
        style={spinning ? styles.spinningButton : styles.spinButton} 
        onClick={randomizePlayer}
        disabled={spinning || (showQuestion && !answerResult)}
      >
        {spinning ? "Spinning..." : "Spin the Mad Gorilla! 🦍"}
      </button>
      
      <div style={styles.instructions}>
        <p>How to play:</p>
        <ol>
          <li>Gather 4 players and name your gorillas</li>
          <li>Press the "Spin" button</li>
          <li>The selected gorilla must answer a personal question about Sam and Emily</li>
          <li>Answer correctly to be safe, or drink if you're wrong! 🍻</li>
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
  selectionMessage: {
    marginTop: '10px',
    fontWeight: 'bold',
    color: '#333'
  },
  drinkMessage: {
    marginTop: '10px',
    fontWeight: 'bold',
    color: '#ff4500'
  },
  correctMessage: {
    marginTop: '10px',
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  questionTitle: {
    color: '#333',
    marginBottom: '10px'
  },
  questionText: {
    fontSize: '18px',
    margin: '15px 0',
    fontWeight: 'bold'
  },
  answerInput: {
    width: '70%',
    padding: '10px',
    margin: '10px auto',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  answerButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '10px'
  },
  nextButton: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '10px'
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
