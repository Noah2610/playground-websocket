const SOCKET_URL = `ws://${location.hostname}:8090`;

let currentPage = null;
let socket = null;
let client = null;

function main() {
    wsConnect();
    showPageLogin();
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

function showPage(page) {
    currentPage = page;
    document
        .querySelectorAll(".page")
        .forEach((pageEl) => pageEl.classList.add("hidden"));
    document
        .querySelector(`.page[data-page="${page}"]`)
        .classList.remove("hidden");
}

function showPageLogin() {
    showPage("login");
    const loginFormEl = document.querySelector("#login");
    loginFormEl.onsubmit = login;
}

function login(event) {
    event.preventDefault();
    const formEl = event.target;
    const nameEl = formEl.querySelector('input[name="name"]');
    const name = nameEl.value;
    if (socket && client && name && !name.match(/^\s*$/)) {
        const data = {
            type: "login",
            payload: {
                clientId: client.id,
                name: name,
            },
        };
        client.name = name;
        socket.send(JSON.stringify(data));
        showPageMain();
    }
}

function showPageMain() {
    showPage("main");
    const sendMessageFormEl = document.querySelector("form#send-message");
    sendMessageFormEl.onsubmit = sendMessage;
}

function handleIncomingData(data) {
    switch (data.type) {
        case "new-client":
            client = {
                id: data.payload,
            };
            break;
        case "message":
            const name = data.payload.client.name;
            const message = data.payload.message;
            console.log(`<${name}> ${message}`);
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
