import Client from "../Client";
const socket = new WebSocket("ws://localhost:15912", {
    headers: {
    // custom headers
    },
});
const client = new Client("Rogue");
client.init(socket);
