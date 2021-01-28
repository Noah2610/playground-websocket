const SOCKET_URL = `ws://${location.hostname}:8090`;

let socket = null;
let client = null;

function main() {
    const connectBtnEl = document.querySelector("button#ws-connect");
    connectBtnEl.onclick = wsConnect;

    const sendMessageFormEl = document.querySelector("form#send-message");
    sendMessageFormEl.onsubmit = sendMessage;
}

function wsConnect() {
    if (socket && client) {
        console.warn("Already connected.");
        return;
    }

    if (socket) {
        socket.close();
    }

    socket = new WebSocket(SOCKET_URL);

    socket.addEventListener("message", (event) => {
        if (event.data) {
            const data = JSON.parse(event.data);
            if (data) {
                handleIncomingData(data);
            }
        }
    });
}

function handleIncomingData(data) {
    switch (data.type) {
        case "new-client":
            client = {
                id: data.payload,
            };
            break;
        case "message":
            console.log(`${data.payload.client.id}> ${data.payload.message}`);
            break;
        default:
            console.error(`Received unknown data type: ${data.type}`, data);
    }
}

function sendMessage(event) {
    event.preventDefault();

    const formEl = event.target;
    const messageEl = formEl.querySelector('input[name="message"]');
    const message = messageEl.value;

    if (socket) {
        const data = {
            type: "message",
            payload: {
                client: client,
                message,
            },
        };
        socket.send(JSON.stringify(data));
    }
}

window.onload = main;
