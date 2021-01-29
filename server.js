const path = require("path");
const WebSocket = require("ws");
const express = require("express");

const APP_PORT = 8080;
const WS_PORT = 8090;

function serveApp() {
    const app = express();

    app.use(express.static("."));

    // app.get("/", (req, res) => {
    //     res.sendFile(path.join(__dirname, "index.html"));
    // });

    app.listen(APP_PORT, () =>
        console.log(`Server running on http://0.0.0.0:${APP_PORT}`)
    );
}

function startWebsocket() {
    function newClient(socket) {
        const id =
            (connectedClients[connectedClients.length - 1] || { id: 0 }).id + 1;
        const client = {
            id,
            socket,
            name: null,
        };
        connectedClients.push(client);
        return client;
    }

    function sendMessage(fromClient, message) {
        for (const client of connectedClients) {
            const data = {
                type: "message",
                payload: {
                    client: {
                        id: fromClient.id,
                        name: fromClient.name,
                    },
                    message,
                },
            };
            client.socket.send(JSON.stringify(data));
        }
    }

    let connectedClients = [];

    const server = new WebSocket.Server({
        host: "0.0.0.0",
        port: WS_PORT,
    });

    server.on("connection", (socket) => {
        const client = newClient(socket);
        const data = {
            type: "new-client",
            payload: client.id,
        };
        socket.send(JSON.stringify(data));

        socket.on("message", (dataRaw) => {
            const data = JSON.parse(dataRaw);
            switch (data.type) {
                case "message": {
                    const client = connectedClients.find(
                        (checkClient) =>
                            checkClient.id === data.payload.client.id
                    );
                    sendMessage(client, data.payload.message);
                    break;
                }
                case "login": {
                    const { clientId, name } = data.payload;
                    const client = connectedClients.find(
                        (checkClient) => checkClient.id === clientId
                    );
                    if (client) {
                        client.name = name;
                    }
                    break;
                }
                default: {
                    console.error(
                        `Received unknown message type: ${data.type}`,
                        data
                    );
                }
            }
        });
    });
}

serveApp();
startWebsocket();
