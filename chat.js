document.addEventListener('DOMContentLoaded', () => {
    const SOCKET_SERVER = 'https://your-socket-server-url.com';
    const socket = io(SOCKET_SERVER, {
        reconnectionAttempts: 5,
        timeout: 10000
    });

    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const username = 'Farter_' + Math.floor(Math.random() * 10000);

    // Connection handling
    socket.on('connect', () => {
        enableChat();
        addSystemMessage('Connected to chat! 💨');
        socket.emit('join', { username });
    });

    socket.on('connect_error', () => {
        disableChat();
        addSystemMessage('Connection error! Trying to reconnect... 😕');
    });

    socket.on('disconnect', () => {
        disableChat();
        addSystemMessage('Disconnected from chat! 😢');
    });

    // Chat events
    socket.on('chat message', (data) => {
        const isOwnMessage = data.username === username;
        addMessage(data.username, data.text, isOwnMessage ? 'sent' : 'received');
    });

    socket.on('user joined', (data) => {
        addSystemMessage(`${data.username} joined the chat 👋`);
    });

    socket.on('user left', (data) => {
        addSystemMessage(`${data.username} left the chat 💨`);
    });

    function addMessage(username, text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-info">${username}</div>
            <div class="message-text">${sanitizeHTML(text)}</div>
        `;
        appendMessage(messageDiv);
    }

    function addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.innerHTML = `<div class="message-text">${text}</div>`;
        appendMessage(messageDiv);
    }

    function appendMessage(messageDiv) {
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.style.opacity = '1', 10);
    }

    function sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function enableChat() {
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.placeholder = "Type your message...";
    }

    function disableChat() {
        messageInput.disabled = true;
        sendButton.disabled = true;
        messageInput.placeholder = "Connecting...";
    }

    function sendMessage() {
        const text = messageInput.value.trim();
        if (text && socket.connected) {
            socket.emit('chat message', { username, text });
            messageInput.value = '';
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Initial state
    disableChat();
});
