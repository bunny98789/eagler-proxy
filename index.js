const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 }, () => {
    console.log("Eaglercraft 1.12 Full Protocol Processor Active!");
});

function writeVarInt(value) {
    const buffer = [];
    while (true) {
        if ((value & 0xFFFFFF80) === 0) {
            buffer.push(value);
            return Buffer.from(buffer);
        }
        buffer.push((value & 0x7F) | 0x80);
        value >>>= 7;
    }
}

wss.on('connection', (ws) => {
    ws.binaryType = 'arraybuffer';
    let javaClient = null;
    let handshakeCompleted = false;

    ws.on('message', (message) => {
        const msgBuffer = Buffer.from(message);

        // Safely catch and reply to browser status requests/server pings
        if (msgBuffer.length > 2 && msgBuffer[0] === 0x01 && msgBuffer[1] === 0x00) {
            const statusJSON = JSON.stringify({
                version: { name: "Eaglercraft 1.12.2", protocol: 340 },
                players: { max: 100, online: 1, sample: [] },
                description: { text: "§bDeathThrow SMP §7| §aEaglercraft 24/7" }
            });
            const dataBytes = Buffer.from(statusJSON, 'utf8');
            const response = Buffer.concat([Buffer.from([0x01, 0x00]), writeVarInt(dataBytes.length), dataBytes]);
            if (ws.readyState === WebSocket.OPEN) ws.send(response);
            return;
        }

        // Initialize connection straight to the active dynamic Aternos host
        if (!javaClient) {
            javaClient = net.createConnection({ host: 'roach.aternos.host', port: 53287 }, () => {
                console.log("Protocol Bridge: Pipe established to Aternos core.");
            });

            javaClient.on('data', (data) => {
                if (ws.readyState === WebSocket.OPEN) ws.send(data);
            });

            javaClient.on('close', () => ws.close());
            javaClient.on('error', () => ws.close());
        }

        if (javaClient.writable) {
            javaClient.write(msgBuffer);
        }
    });

    ws.on('close', () => { if (javaClient) javaClient.end(); });
    ws.on('error', () => { if (javaClient) javaClient.end(); });
});
