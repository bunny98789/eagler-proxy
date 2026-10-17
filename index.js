const WebSocket = require('ws');
const net = require('net');

// Create a WebSocket server listening on the port Render gives us
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 }, () => {
    console.log("Eaglercraft 24/7 Reverse Proxy is running smoothly!");
});

wss.on('connection', (ws) => {
    // This connects incoming browser traffic right into your Aternos backend IP and Port
    const client = net.createConnection({ host: 'deaththrowSMP.aternos.me', port: 53287 }, () => {
        console.log("Player connecting through proxy to Aternos backend!");
    });

    ws.on('message', (message) => { if (client.writable) client.write(message); });
    client.on('data', (data) => { if (ws.readyState === WebSocket.OPEN) ws.send(data); });
    
    ws.on('close', () => client.end());
    client.on('close', () => ws.close());
    ws.on('error', () => client.end());
    client.on('error', () => ws.close());
});
