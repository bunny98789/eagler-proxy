const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 }, () => {
    console.log("Eaglercraft 24/7 Universal Protocol Bridge is active!");
});

wss.on('connection', (ws) => {
    console.log("Player shaking hands... Bridging connection to Aternos backend!");

    // Connect directly to your Aternos backend IP and port
    const client = net.createConnection({ host: 'deaththrowSMP.aternos.me', port: 53287 }, () => {
        console.log("Connection established with Aternos Java Core.");
    });

    ws.on('message', (message, isBinary) => {
        if (client.writable) {
            // Handles both modern binary buffers and older string representations safely
            const packet = isBinary ? message : Buffer.from(message);
            client.write(packet);
        }
    });

    client.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            // Sends raw data array blocks back to the browser client properly
            ws.send(data, { binary: true });
        }
    });

    ws.on('close', () => client.end());
    client.on('close', () => ws.close());
    ws.on('error', () => client.end());
    client.on('error', () => ws.close());
});
