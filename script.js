// ====== Configuration ======
let player1Name = 'P1';
let player2Name = 'P2';
let startingPlayer = 'X';
let currentPlayer = startingPlayer;
let gameOver = false;
let roundResult;
let gameMode;
let difficulty;
let winningCombo;
let scores = { X: 0, O: 0, Draw: 0 };

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
    [0, 4, 8], [2, 4, 6]              // Diagonals
];

const bannedInitials = [
    'ASS', 'BCH', 'BJX', 'CUM', 'DIK', 'DIE', 'FAG', 'FAP', 'FML',
    'FUK', 'JIZ', 'JRK', 'KKK', 'KYS', 'PEN', 'PMS', 'POO', 'SEX',
    'SHI', 'SHT', 'SUC', 'SUX', 'TIT', 'VAG', 'WTF', 'XXX', 'GAY', 
    'HIV', 'LSD', 'NAZ', 'NEG', 'NER', 'NUT', 'PIS', 'WAR'
];


// ====== DOM Elements ======
const cells = document.querySelectorAll('.cell');
const restartButton = document.getElementById('restartButton');
const startMenu = document.getElementById('startMenu');
const gameBoard = document.getElementById('game');
const playFriendBtn = document.getElementById('playFriendBtn');
const backButton = document.getElementById('back-button');
const nameForm = document.getElementById('nameForm');
const player1Input = document.getElementById('player1Input');
const player2Input = document.getElementById('player2Input');
const startGameBtn = document.getElementById('startGameBtn');
const playAIBtn = document.getElementById('playAIBtn');
const aiDifficultyMenu = document.getElementById('aiDifficultyMenu');
const easyAiBtn = document.getElementById('easyAiBtn');
const hardAiBtn = document.getElementById('hardAiBtn');
const modeSwitch = document.getElementById('modeSwitch');
const normalBtn = document.getElementById('normalAiBtn');

normalBtn.addEventListener('click', () => {
    gameMode = 'AI';
    difficulty = 'normal';
    startGame();
});

// ====== Mode Switch: Dark/Light Theme ======
modeSwitch.addEventListener('change', function() {
    if (this.checked) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    }
});


// ====== Event Listeners ======

// Restart Button
restartButton.addEventListener('click', restart);

// Play Friend Button
playFriendBtn.addEventListener('click', () => {
    startMenu.style.display = 'none';
    nameForm.style.display = 'flex'; // Show the name form instead of the game directly
    game.style.display = 'flex';
});

// Start Game Button (VS Mode)
startGameBtn.addEventListener('click', () => {
    gameMode = 'VS';
    startGame();
});

// Back Button
backButton.addEventListener('click', () => {
    gameBoard.style.display = 'none';
    nameForm.style.display = 'none';
    startMenu.style.display = 'flex';
    backToMenu();
});

// Play AI Button
playAIBtn.addEventListener('click', () => {
    startMenu.style.display = 'none';
    aiDifficultyMenu.style.display = 'flex';
});

// Easy AI Button
easyAiBtn.addEventListener('click', () => {
    gameMode = 'AI';
    difficulty = 'easy';
    startGame();
});

// Hard AI Button
hardAiBtn.addEventListener('click', () => {
    gameMode = 'AI';
    difficulty = 'hard';
    startGame();
});


// ====== Game Functions ======

// Start the game with player names or AI mode
function startGame() {
    if(gameMode === 'VS'){
        const name1 = player1Input.value.toUpperCase();
        const name2 = player2Input.value.toUpperCase();
  
        if (name1.length !== 3 || name2.length !== 3) {
            // If names are not exactly 3 letters
            alert('Names must be exactly 3 letters.');
            return;
        }

        if (bannedInitials.includes(name1) || bannedInitials.includes(name2)) {
            // If names contain inappropriate initials
            alert('Names must be appropriate and not contain any inappropriate words.');
            return;
        }

        if (name1 == name2){
            alert('Names must be unique');
            return;
        }

        player1Name = name1;
        player2Name = name2;

        document.getElementById('scoreX').textContent = `${player1Name} Wins: 0`;
        document.getElementById('scoreO').textContent = `${player2Name} Wins: 0`;
        document.getElementById('scoreDraw').textContent = `Draws: 0`;
        nameForm.style.display = 'none';
        gameBoard.style.display = 'flex';
    } else if(gameMode === 'AI'){
        startMenu.style.display = 'none';
        aiDifficultyMenu.style.display = 'none';
        gameBoard.style.display = 'flex';

        player1Name = 'Human';
        player2Name = 'AI';  // Player 2 is the AI

        document.getElementById('scoreX').textContent = `${player1Name} Wins: 0`;
        document.getElementById('scoreO').textContent = `${player2Name} Wins: 0`;
        document.getElementById('scoreDraw').textContent = `Draws: 0`;

        updateScoreboard();
        resetBoard();
    }
}

// Handle the click event for a cell
function handleCellClick(cell, index) {
    if (!cell.textContent && !gameOver) {
        cell.textContent = currentPlayer;  // Set the current player's symbol
        
        if (gameMode === 'AI' && currentPlayer === 'O' && !gameOver) {
            aiMove();
        } else {
            checkGameOver();
        }
    }
}

// Check if the game is over (win or draw)
function checkGameOver(){
    if (checkWinner()) {
        highlightWinningCells(winningCombo);
        setTimeout(() => alert(`${currentPlayer === 'X' ? player1Name : player2Name} wins!`), 100);  // Delay the alert so it shows after the move
        gameOver = true;  // Stop the game
        roundResult = currentPlayer;
        updateScoreboard();
        buttonDisplay();
    } else if (checkDraw()) {
        setTimeout(() => alert("Draw!"), 100);
        gameOver = true;  // Stop the game
        roundResult = 'Draw';
        updateScoreboard();
        buttonDisplay();
    } else {
        switchPlayer();
    }
}

// Switch between players (X and O)
function switchPlayer() {
    currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';  // Switch between X and O

    // If it's AI's turn, automatically call aiMove
    if (gameMode === 'AI' && currentPlayer === 'O') {
        requestAnimationFrame(aiMove);
    }
}

// Check if a player has won
function checkWinner() {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (
          cells[a].textContent &&
          cells[a].textContent === cells[b].textContent &&
          cells[a].textContent === cells[c].textContent
        ) {
          winningCombo = [a, b, c];
          return cells[a].textContent; // returns 'X' or 'O'
        }
      }
      return null;
}

// Check if the game is a draw
function checkDraw(){
    for (const cell of cells) {
        if (cell.textContent === '') return false;  // Still moves left
    }
    return true;
}

// Restart the game
function restart(){
    gameOver = false;
    startingPlayer = startingPlayer === 'X' ? 'O' : 'X';
    currentPlayer = startingPlayer;
    buttonDisplay();
    clearBoard();
    if (currentPlayer === 'O' && gameMode === 'AI') {
        requestAnimationFrame(aiMove); // Let AI move immediately if it's their turn
    }
}

// Go back to the main menu
function backToMenu(){
    gameOver = false;
    startingPlayer = 'X';
    currentPlayer = startingPlayer;
    restartButton.style.display = 'none';
    player1Name = 'Player1';
    player2Name = 'Player2';
    clearBoard();
    clearScore();
}

// Show or hide the restart button
function buttonDisplay(){
    restartButton.style.display = restartButton.style.display === 'block' ? 'none' : 'block';
}

// Highlight the winning cells
function highlightWinningCells(indices){
    indices.forEach(index => {
        cells[index].classList.add('winning-cell');
      });
}

// Clear the game board
function clearBoard(){
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning-cell');
    });
}

// Update the scoreboard
function updateScoreboard(){
    if (roundResult === 'X') {
        scores.X++;
        document.getElementById('scoreX').textContent = `${player1Name} Wins: ${scores.X}`;
    } else if (roundResult === 'O') {
        scores.O++;
        document.getElementById('scoreO').textContent = `${player2Name} Wins: ${scores.O}`;
    } else if (roundResult === 'Draw') {
        scores.Draw++;
        document.getElementById('scoreDraw').textContent = `Draws: ${scores.Draw}`;
    }
}

// Clear the scores
function clearScore(){
    for (let key in scores) {
        scores[key] = 0;
    }

    roundResult = null;

    document.getElementById('scoreX').textContent = `${player1Name} Wins: 0`;
    document.getElementById('scoreO').textContent = `${player2Name} Wins: 0`;
    document.getElementById('scoreDraw').textContent = `Draws: 0`;
}

// AI's move (easy or hard difficulty)
function aiMove() {
    // EASY AI: pick a random empty cell
    if (difficulty === 'easy') {
        let emptyCells = [];
        cells.forEach((cell, index) => {
            if (!cell.textContent) emptyCells.push(index);
        });

        if (emptyCells.length > 0) {
            const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            cells[randomIndex].textContent = 'O';
            checkGameOver();
        }

    } else if (difficulty === 'normal') {
        // Create a simplified copy of the current board
        let board = [];
        cells.forEach(cell => {
            board.push(cell.textContent || '');
        });
        
        // Step 1: Try to block the player from winning
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X'; // simulate player move
                if (checkVirtualWinner(board) === 'X') {
                    cells[i].textContent = 'O'; // AI blocks with O
                    checkGameOver();
                    return;
                }
                board[i] = ''; // undo simulation
            }
        }
    
        // Step 2: Take the center if it's free
        if (!cells[4].textContent) {
            cells[4].textContent = 'O';
            checkGameOver();
            return;
        }
    
        // Step 3: Pick a random empty cell
        let emptyCells = [];
        cells.forEach((cell, index) => {
            if (!cell.textContent) emptyCells.push(index);
        });
    
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            cells[emptyCells[randomIndex]].textContent = 'O';
            checkGameOver();
        }
    }else if (difficulty === 'hard') {
        // Create a simplified representation of the board
        let board = [];
        cells.forEach(cell => {
            board.push(cell.textContent || '');
        });

        let bestScore = -Infinity;
        let bestMove;

        // Evaluate each possible move
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                board[i] = 'O'; // Simulate AI move
                let score = minimax(board, false); // Evaluate outcome
                board[i] = ''; // Undo move

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        if (bestMove !== undefined) {
            cells[bestMove].textContent = 'O';
            checkGameOver();
        }
    }
}

// Recursively scores board states from AI's perspective
function minimax(board, isMaximizing) {
    let winner = checkVirtualWinner(board);
    if (winner === 'O') return 1;
    if (winner === 'X') return -1;
    if (!board.includes('')) return 0; // No moves left (draw)

    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < board.length; i++) {
        if (!board[i]) {
            board[i] = isMaximizing ? 'O' : 'X'; // Simulate move
            let score = minimax(board, !isMaximizing); // Recurse
            board[i] = ''; // Undo move

            // Choose the best score depending on who's playing
            bestScore = isMaximizing
                ? Math.max(score, bestScore)
                : Math.min(score, bestScore);
        }
    }

    return bestScore;
}

// Check for a winner in the virtual board (used in minimax)
function checkVirtualWinner(board) {
    const combos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (let [a, b, c] of combos) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}


// ====== Add a click event listener to each cell ======
cells.forEach((cell, index) => {
    cell.addEventListener('click', function() {
        handleCellClick(cell, index);  // Call the handleCellClick function
    });
});
