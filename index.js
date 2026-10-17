const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 }, () => {
    console.log("Eaglercraft 24/7 Universal Protocol Bridge is active!");
});

wss.on('connection', (ws, req) => {
    // Force binary protocol formatting required by Eaglercraft 1.12 clients
    ws.binaryType = 'arraybuffer';
    
    const client = net.createConnection({ host: 'deaththrowSMP.aternos.me', port: 53287 }, () => {
        console.log("Handshake successful. Framing data stream into Java Core.");
    });

    ws.on('message', (message) => {
        if (client.writable) {
            // Converts web array data into raw Java TCP buffers automatically
            const buffer = Buffer.from(message);
            client.write(buffer);
        }
    });

    client.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    });

    ws.on('close', () => client.end());
    client.on('close', () => ws.close());
    ws.on('error', () => client.end());
    client.on('error', () => ws.close());
});
