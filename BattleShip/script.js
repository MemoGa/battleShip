document.addEventListener('DOMContentLoaded', () => {
    const playerGrid = document.getElementById('player-grid');
    const computerGrid = document.getElementById('computer-grid');
    const messageDisplay = document.getElementById('message');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const shipsToPlace = document.getElementById('ships-to-place');
    const rotateButton = document.getElementById('rotate-button');
    const randomShipsButton = document.getElementById('random-ships-button');
    const gameArea = document.getElementById('game-area');

    const width = 10;
    let playerCells = [];
    let computerCells = [];
    let playerShips = [];
    let computerShips = [];
    let isGameOver = false;
    let currentPlayer = 'player';
    let isHorizontal = true;
    let currentShip = null;
    let remainingShips = [];

    const shipList = [
        { name: 'destroyer', length: 2, image: 'destructor' },
        { name: 'submarine', length: 3, image: 'submarino' },
        { name: 'cruiser', length: 3, image: 'cruzero' },
        { name: 'battleship', length: 4, image: 'acorazado' },
        { name: 'carrier', length: 5, image: 'porta_Aviones' }
    ];

    // --- Funciones de Inicialización ---

    function createGrid(gridElement, cellsArray) {
        gridElement.innerHTML = '';
        for (let i = 0; i < width * width; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.id = i;
            gridElement.appendChild(cell);
            cellsArray.push(cell);
        }
    }

    function initializeShipPlacement() {
        remainingShips = [...shipList];
        shipsToPlace.innerHTML = '';
        remainingShips.forEach(ship => {
            const shipElement = document.createElement('div');
            shipElement.classList.add('ship-to-place');
            shipElement.dataset.length = ship.length;
            shipElement.dataset.name = ship.name;
            shipElement.dataset.image = ship.image;
            
            const shipImage = document.createElement('img');
            shipImage.src = `assets/${ship.image}.png`;
            shipImage.alt = ship.name;
            
            const shipName = document.createElement('span');
            shipName.textContent = ship.name;
            
            shipElement.appendChild(shipImage);
            shipElement.appendChild(shipName);
            shipsToPlace.appendChild(shipElement);
        });
        currentShip = null;
        isHorizontal = true;
        messageDisplay.textContent = 'Selecciona un barco para colocarlo';
        startButton.disabled = true;
    }

    function highlightCells(cellId) {
        if (!currentShip) return;
        
        // Remove previous highlights
        playerCells.forEach(cell => cell.classList.remove('highlight'));
        
        const length = currentShip.length;
        const positions = [];
        let isValid = true;

        for (let i = 0; i < length; i++) {
            let pos;
            if (isHorizontal) {
                pos = cellId + i;
                if (Math.floor(pos / width) !== Math.floor(cellId / width)) {
                    isValid = false;
                    break;
                }
            } else {
                pos = cellId + (i * width);
                if (pos >= width * width) {
                    isValid = false;
                    break;
                }
            }
            
            if (playerCells[pos].classList.contains('ship')) {
                isValid = false;
                break;
            }
            positions.push(pos);
        }

        if (isValid) {
            positions.forEach(pos => {
                playerCells[pos].classList.add('highlight');
            });
        }
    }

    function placeShip(cellId) {
        if (!currentShip) return;
        
        const length = currentShip.length;
        const positions = [];
        let isValid = true;

        for (let i = 0; i < length; i++) {
            let pos;
            if (isHorizontal) {
                pos = cellId + i;
                if (Math.floor(pos / width) !== Math.floor(cellId / width)) {
                    isValid = false;
                    break;
                }
            } else {
                pos = cellId + (i * width);
                if (pos >= width * width) {
                    isValid = false;
                    break;
                }
            }
            
            if (playerCells[pos].classList.contains('ship')) {
                isValid = false;
                break;
            }
            positions.push(pos);
        }

        if (isValid) {
            positions.forEach(pos => {
                playerCells[pos].classList.add('ship', currentShip.name);
                if (!isHorizontal) {
                    playerCells[pos].style.transform = 'rotate(90deg)';
                }
            });
            playerShips.push({
                name: currentShip.name,
                positions: positions,
                hits: 0,
                isHorizontal: isHorizontal
            });
            
            remainingShips = remainingShips.filter(ship => ship.name !== currentShip.name);
            currentShip = null;
            
            updateShipSelection();
        }
    }

    function showExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
      
        document.body.appendChild(explosion);
      
        setTimeout(() => {
          explosion.remove();
        }, 800);
        
    }
      

    function updateShipSelection() {
        shipsToPlace.innerHTML = '';
        remainingShips.forEach(ship => {
            const shipElement = document.createElement('div');
            shipElement.classList.add('ship-to-place');
            shipElement.dataset.length = ship.length;
            shipElement.dataset.name = ship.name;
            shipElement.dataset.image = ship.image;
            
            const shipImage = document.createElement('img');
            shipImage.src = `assets/${ship.image}.png`;
            shipImage.alt = ship.name;
            
            const shipName = document.createElement('span');
            shipName.textContent = ship.name;
            
            shipElement.appendChild(shipImage);
            shipElement.appendChild(shipName);
            shipsToPlace.appendChild(shipElement);
        });

        if (remainingShips.length === 0) {
            messageDisplay.textContent = '¡Todos los barcos colocados! Presiona "Comenzar Juego"';
            startButton.disabled = false;
        } else {
            messageDisplay.textContent = 'Selecciona el siguiente barco';
        }
    }

    function placeShipsRandomly(ships, cells) {
        let placedShips = [];
        ships.forEach(ship => {
            let placed = false;
            while (!placed) {
                const isHorizontal = Math.random() < 0.5;
                const randomStartIndex = Math.floor(Math.random() * (width * width));

                let potentialShipPositions = [];
                let isValidPlacement = true;

                if (isHorizontal) {
                    const rowStart = Math.floor(randomStartIndex / width);
                    const rowEnd = Math.floor((randomStartIndex + ship.length - 1) / width);
                    if (rowStart !== rowEnd) {
                        isValidPlacement = false;
                    }
                } else {
                    if (randomStartIndex + ship.length * width > width * width) {
                        isValidPlacement = false;
                    }
                }

                if (isValidPlacement) {
                    for (let i = 0; i < ship.length; i++) {
                        let cellIndex;
                        if (isHorizontal) {
                            cellIndex = randomStartIndex + i;
                        } else {
                            cellIndex = randomStartIndex + i * width;
                        }

                        if (cells[cellIndex] && cells[cellIndex].classList.contains('ship')) {
                            isValidPlacement = false;
                            break;
                        }
                        potentialShipPositions.push(cellIndex);
                    }
                }

                if (isValidPlacement) {
                    potentialShipPositions.forEach(index => {
                        cells[index].classList.add('ship', ship.name);
                        if (!isHorizontal) {
                            cells[index].style.transform = 'rotate(90deg)';
                        }
                    });
                    placedShips.push({
                        name: ship.name,
                        positions: potentialShipPositions,
                        hits: 0,
                        isHorizontal: isHorizontal
                    });
                    placed = true;
                }
            }
        });
        return placedShips;
    }

    shipsToPlace.addEventListener('click', (e) => {
        const shipElement = e.target.closest('.ship-to-place');
        if (shipElement) {
            currentShip = {
                name: shipElement.dataset.name,
                length: parseInt(shipElement.dataset.length),
                image: shipElement.dataset.image
            };
            messageDisplay.textContent = `Coloca el ${currentShip.name}`;
        }
    });

    rotateButton.addEventListener('click', () => {
        isHorizontal = !isHorizontal;
        if (currentShip) {
            messageDisplay.textContent = `Coloca el ${currentShip.name} (${isHorizontal ? 'horizontal' : 'vertical'})`;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            isHorizontal = !isHorizontal;
            if (currentShip) {
                messageDisplay.textContent = `Coloca el ${currentShip.name} (${isHorizontal ? 'horizontal' : 'vertical'})`;
            }
        }
    });

    randomShipsButton.addEventListener('click', () => {
        playerCells.forEach(cell => {
            cell.classList.remove('ship', 'destroyer', 'submarine', 'cruiser', 'battleship', 'carrier');
            cell.style.transform = '';
        });
        playerShips = [];
        playerShips = placeShipsRandomly(shipList, playerCells);
        remainingShips = [];
        updateShipSelection();
    });

    playerGrid.addEventListener('mouseover', (e) => {
        const cell = e.target.closest('.cell');
        if (cell) {
            highlightCells(parseInt(cell.dataset.id));
        }
    });

    playerGrid.addEventListener('mouseout', () => {
        playerCells.forEach(cell => cell.classList.remove('highlight'));
    });

    playerGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('.cell');
        if (cell) {
            placeShip(parseInt(cell.dataset.id));
        }
    });

    // --- Lógica del Juego ---

    window.startGame = function() {
        if (remainingShips.length > 0) {
            messageDisplay.textContent = '¡Debes colocar todos los barcos primero!';
            return;
        }

        isGameOver = false;
        messageDisplay.textContent = '¡Comienza el juego! Tu turno.';

        document.querySelector('.ship-controls').style.display = 'none';

        computerCells = [];
        createGrid(computerGrid, computerCells);
        computerShips = placeShipsRandomly(shipList, computerCells);

        computerCells.forEach(cell => {
            cell.removeEventListener('click', handleShot);
            cell.addEventListener('click', handleShot);
        });

        startButton.style.display = 'none';
        resetButton.style.display = 'inline-block';
    }

    window.resetGame = function() {
        isGameOver = true;
        messageDisplay.textContent = 'Juego reiniciado. Coloca tus barcos para comenzar.';
        computerCells.forEach(cell => cell.removeEventListener('click', handleShot));

        document.querySelector('.ship-controls').style.display = 'flex';

        playerGrid.innerHTML = '';
        computerGrid.innerHTML = '';

        playerCells = [];
        computerCells = [];
        playerShips = [];
        computerShips = [];
        currentPlayer = 'player';

        createGrid(playerGrid, playerCells);
        initializeShipPlacement();

        startButton.style.display = 'inline-block';
        startButton.disabled = true;
        resetButton.style.display = 'none';
    }

    function handleShot(e) {
        if (isGameOver || currentPlayer !== 'player') return;

        const cell = e.target;
        const cellId = parseInt(cell.dataset.id);

        if (cell.classList.contains('hit') || cell.classList.contains('miss')) {
            messageDisplay.textContent = 'Ya disparaste en esta posición. Elige otra.';
            return;
        }

        if (cell.classList.contains('ship')) {
            cell.classList.add('hit');
            messageDisplay.textContent = '¡Acierto!';
            checkShipHit(cellId, computerShips);
        } else {
            cell.classList.add('miss');
            messageDisplay.textContent = '¡Fallo!';
        }

        checkWinCondition();
        if (!isGameOver) {
            currentPlayer = 'computer';
            setTimeout(computerTurn, 1000);
        }

        if (cell.classList.contains('ship')) {
            cell.classList.add('hit');
            messageDisplay.textContent = '¡Acierto!';
        
            const x = cell.offsetLeft + computerGrid.offsetLeft;
            const y = cell.offsetTop + computerGrid.offsetTop;
            showExplosion(x, y);
        
            checkShipHit(cellId, computerShips);
        }
        
    }

    function checkShipHit(cellId, ships) {
        ships.forEach(ship => {
            const index = ship.positions.indexOf(cellId);
            if (index !== -1) {
                ship.hits++;
                if (ship.hits === ship.length) {
                    messageDisplay.textContent += ` ¡Hundiste el ${ship.name} enemigo!`;
                }
            }
        });
    }

    function computerTurn() {
        if (isGameOver) return;

        let shotTaken = false;
        while (!shotTaken) {
            const randomCellId = Math.floor(Math.random() * (width * width));
            const targetCell = playerCells[randomCellId];

            if (!targetCell.classList.contains('hit') && !targetCell.classList.contains('miss')) {
                if (targetCell.classList.contains('ship')) {
                    targetCell.classList.add('hit');
                    messageDisplay.textContent = '¡El enemigo te ha golpeado!';
                    checkShipHit(randomCellId, playerShips);
                } else {
                    targetCell.classList.add('miss');
                    messageDisplay.textContent = 'El enemigo ha fallado.';
                }
                shotTaken = true;
            }
        }
        checkWinCondition();
        if (!isGameOver) {
            currentPlayer = 'player';
            messageDisplay.textContent += ' Tu turno.';
        }

        if (targetCell.classList.contains('ship')) {
            targetCell.classList.add('hit');
            messageDisplay.textContent = '¡El enemigo te ha golpeado!';
        
            const x = targetCell.offsetLeft + playerGrid.offsetLeft;
            const y = targetCell.offsetTop + playerGrid.offsetTop;
            showExplosion(x, y);
        
            checkShipHit(randomCellId, playerShips);
        }
        
    }

    function checkWinCondition() {
        const playerShipsSunk = playerShips.every(ship => ship.hits === ship.length);
        const computerShipsSunk = computerShips.every(ship => ship.hits === ship.length);

        if (playerShipsSunk) {
            messageDisplay.textContent = '¡GAME OVER! La computadora ha ganado.';
            isGameOver = true;
        } else if (computerShipsSunk) {
            messageDisplay.textContent = '¡Felicidades! ¡Has ganado el juego!';
            isGameOver = true;
        }

        if (isGameOver) {
            computerCells.forEach(cell => cell.removeEventListener('click', handleShot));
            if (computerShipsSunk) {
                computerShips.forEach(ship => {
                    ship.positions.forEach(pos => {
                        if (!computerCells[pos].classList.contains('hit')) {
                             computerCells[pos].classList.add('ship');
                        }
                    });
                });
            }
            startButton.style.display = 'inline-block'; 
        }
    }

    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target === gameArea && !gameArea.classList.contains('hidden')) {
                createGrid(playerGrid, playerCells);
                initializeShipPlacement();
            }
        });
    });

    observer.observe(gameArea, {
        attributes: true,
        attributeFilter: ['class']
    });
});