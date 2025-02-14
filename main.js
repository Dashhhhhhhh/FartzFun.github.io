document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.text-container');
    const spinningText = document.querySelector('.spinning-text');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    function setTranslate(xPos, yPos) {
        xOffset = xPos;
        yOffset = yPos;
        container.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        const clickTarget = e.target;
        // Allow dragging when clicking the container or any child element
        if (container.contains(clickTarget) || container === clickTarget) {
            isDragging = true;
        }
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            setTranslate(currentX, currentY);
        }
    }

    // Mouse events - attach to both container and spinning text
    container.addEventListener('mousedown', dragStart);
    spinningText.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // Touch events - attach to both container and spinning text
    container.addEventListener('touchstart', dragStart);
    spinningText.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);
});
