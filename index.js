const WebSocket = require('ws');
const net = require('net');

// Create the WebSocket server listening on the port Render assigns
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 }, () => {
    console.log("Eaglercraft 24/7 Universal Protocol Proxy is now live!");
});

wss.on('connection', (ws) => {
    console.log("Player shaking hands... Bridging connection to Aternos backend!");

    // Connect directly to your Aternos backend IP and port
    const client = net.createConnection({ host: 'deaththrowSMP.aternos.me', port: 53287 }, () => {
        console.log("Connection established with Aternos Java Core.");
    });

    // Pipe the data layers cleanly back and forth
    ws.on('message', (message) => {
        if (client.writable) {
            client.write(message);
        }
    });

    client.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data, { binary: true });
        }
    });

    // Handle abrupt player disconnections gracefully
    ws.on('close', () => client.end());
    client.on('close', () => ws.close());
    ws.on('error', () => client.end());
    client.on('error', () => ws.close());
});
