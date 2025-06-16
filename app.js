// DOM elements
let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let modeSelector = document.querySelector("#mode-selector");
let vsFriendBtn = document.querySelector("#vs-friend");
let vsComputerBtn = document.querySelector("#vs-computer");
let mainContent = document.querySelector("main");
let changeModeBtn = document.querySelector("#change-mode-btn");
let gameStatusText = document.querySelector("#game-status");

// Game variables
let turnO = true; // playerO starts
let count = 0; // To track moves for draw
let gameActive = false;
let computerMode = false;

const winPatterns = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8],
];

// Mode selection
vsFriendBtn.addEventListener("click", () => {
  computerMode = false;
  startGame();
});

vsComputerBtn.addEventListener("click", () => {
  computerMode = true;
  startGame();
});

changeModeBtn.addEventListener("click", () => {
  showModeSelector();
});

// Function to start game after mode selection
function startGame() {
  modeSelector.classList.add("hide");
  mainContent.classList.remove("hide");
  resetGame();
  gameActive = true;
  
  // Scroll to the game board smoothly
  const gameBoard = document.querySelector(".container");
  if (gameBoard) {
    gameBoard.scrollIntoView({ 
      behavior: "smooth",
      block: "center" 
    });
  }
}

// Function to show mode selector
function showModeSelector() {
  mainContent.classList.add("hide");
  msgContainer.classList.add("hide");
  modeSelector.classList.remove("hide");
  
  // Scroll to the top of the mode selector smoothly
  modeSelector.scrollIntoView({ 
    behavior: "smooth",
    block: "start" 
  });
}

// Update game status display
function updateGameStatus() {
  if (gameActive) {
    gameStatusText.innerText = turnO ? "Player O's turn" : (computerMode ? "Computer's turn (X)" : "Player X's turn");
  }
}

// Reset game state
const resetGame = () => {
  turnO = true;
  count = 0;
  enableBoxes();
  msgContainer.classList.add("hide");
  gameActive = true;
  updateGameStatus();
};

// Computer's move
function computerMove() {
  // If game is not active, don't make a move
  if (!gameActive) return;
  
  // Small delay to make it feel more natural
  setTimeout(() => {
    // Try to win first
    const winMove = findBestMove('X');
    if (winMove !== -1) {
      makeMove(winMove);
      return;
    }
    
    // Then try to block opponent
    const blockMove = findBestMove('O');
    if (blockMove !== -1) {
      makeMove(blockMove);
      return;
    }
    
    // Take center if available
    if (boxes[4].innerText === "") {
      makeMove(4);
      return;
    }
    
    // Take any available corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => boxes[i].innerText === "");
    if (availableCorners.length > 0) {
      const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
      makeMove(randomCorner);
      return;
    }
    
    // Take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(i => boxes[i].innerText === "");
    if (availableSides.length > 0) {
      const randomSide = availableSides[Math.floor(Math.random() * availableSides.length)];
      makeMove(randomSide);
      return;
    }
  }, 500);
}

// Helper function to find winning or blocking move
function findBestMove(symbol) {
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [boxes[a].innerText, boxes[b].innerText, boxes[c].innerText];
    
    // Check if we can win or block in this pattern
    if (values.filter(v => v === symbol).length === 2 && 
        values.filter(v => v === "").length === 1) {
      // Find the empty position
      const emptyIndex = values.findIndex(v => v === "");
      return pattern[emptyIndex];
    }
  }
  
  return -1; // No winning or blocking move found
}

// Helper function to make a computer move
function makeMove(index) {
  if (boxes[index].innerText === "" && !turnO && gameActive) {
    boxes[index].innerText = "X";
    boxes[index].disabled = true;
    turnO = true;
    count++;
    
    const isWinner = checkWinner();
    if (count === 9 && !isWinner) {
      gameDraw();
    }
    
    updateGameStatus();
  }
}

// Handle box clicks
boxes.forEach((box, index) => {
  box.addEventListener("click", () => {
    if (box.innerText === "" && gameActive) {
      if (turnO) {
        // Player O
        box.innerText = "O";
        turnO = false;
        box.disabled = true;
        count++;
        
        const isWinner = checkWinner();
        if (!isWinner && count < 9) {
          updateGameStatus();
          
          // Computer's turn if in computer mode
          if (computerMode) {
            computerMove();
          }
        } else if (count === 9 && !isWinner) {
          gameDraw();
        }
      } else if (!computerMode) {
        // Player X (only active in 2-player mode)
        box.innerText = "X";
        turnO = true;
        box.disabled = true;
        count++;
        
        const isWinner = checkWinner();
        if (count === 9 && !isWinner) {
          gameDraw();
        }
        
        updateGameStatus();
      }
    }
  });
});

// Game draw handler
const gameDraw = () => {
  msg.innerText = `Game was a Draw.`;
  msgContainer.classList.remove("hide");
  disableBoxes();
  gameActive = false;
};

// Disable all boxes
const disableBoxes = () => {
  for (let box of boxes) {
    box.disabled = true;
  }
};

// Enable all boxes and clear text
const enableBoxes = () => {
  for (let box of boxes) {
    box.disabled = false;
    box.innerText = "";
  }
};

// Show winner message
const showWinner = (winner) => {
  const winnerText = computerMode && winner === "X" ? "Computer" : `Player ${winner}`;
  msg.innerText = `Congratulations, ${winnerText} wins!`;
  msgContainer.classList.remove("hide");
  disableBoxes();
  gameActive = false;
};

// Check for winner
const checkWinner = () => {
  for (let pattern of winPatterns) {
    let pos1Val = boxes[pattern[0]].innerText;
    let pos2Val = boxes[pattern[1]].innerText;
    let pos3Val = boxes[pattern[2]].innerText;

    if (pos1Val !== "" && pos2Val !== "" && pos3Val !== "") {
      if (pos1Val === pos2Val && pos2Val === pos3Val) {
        showWinner(pos1Val);
        return true;
      }
    }
  }
  return false;
};

// Event listeners for buttons
newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);

// Initialize by showing mode selector
showModeSelector();