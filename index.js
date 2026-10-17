const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 }, () => {
    console.log("Eaglercraft 24/7 Handshake Engine Active!");
});

// A simple helper function to generate compliant Eaglercraft handshake responses
function makeEaglerString(str) {
    const bytes = Buffer.from(str, 'utf8');
    const len = Buffer.alloc(1);
    len.writeUInt8(bytes.length, 0);
    return Buffer.concat([len, bytes]);
}

wss.on('connection', (ws) => {
    ws.binaryType = 'arraybuffer';
    let javaClient = null;

    ws.on('message', (message, isBinary) => {
        const buffer = Buffer.from(message);

        // Detect if the browser client is asking for a server ping/MOTD
        if (buffer.length > 2 && buffer[0] === 0x01 && buffer[1] === 0x00) {
            console.log("Handling Eaglercraft ping query...");
            const motdBlock = JSON.stringify({
                motd: ["§bDeathThrow SMP", "§aEaglercraft 1.12 Online!"],
                max: 100,
                online: 0,
                icon: false
            });
            
            // Send back a formatted Eaglercraft-compliant ping response packet
            const header = Buffer.from([0x01, 0x00]);
            const responsePacket = Buffer.concat([header, makeEaglerString(motdBlock)]);
            if (ws.readyState === WebSocket.OPEN) ws.send(responsePacket);
            return;
        }

        // Handle active player logins by bridging them to the Aternos Java Core
        if (!javaClient) {
            javaClient = net.createConnection({ host: 'deaththrowSMP.aternos.me', port: 53287 }, () => {
                console.log("Bridging player connection directly to Aternos core.");
            });

            javaClient.on('data', (data) => {
                if (ws.readyState === WebSocket.OPEN) ws.send(data);
            });

            javaClient.on('close', () => ws.close());
            javaClient.on('error', () => ws.close());
        }

        if (javaClient.writable) {
            javaClient.write(buffer);
        }
    });

    ws.on('close', () => { if (javaClient) javaClient.end(); });
    ws.on('error', () => { if (javaClient) javaClient.end(); });
});
