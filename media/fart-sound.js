const fartSound = new Audio('media/fart.mp3');

function playFart() {
    // Reset the sound to start if it's already playing
    fartSound.currentTime = 0;
    fartSound.play().catch(err => console.log('Sound blocked by browser'));
}

// Add sound to all interactive elements
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('a, button');
    buttons.forEach(button => {
        button.addEventListener('click', playFart);
    });
});
