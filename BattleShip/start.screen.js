document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const gameArea = document.getElementById('game-area');
    const playButton = document.getElementById('play-button');

    playButton.addEventListener('click', () => {
        // Hide the start screen
        startScreen.classList.add('hidden');
        // Show the game area
        gameArea.classList.remove('hidden');
    });
});