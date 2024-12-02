const express = require("express");
const dgram = require("dgram");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Endpoint to send a WOL packet
app.post("/wake", (req, res) => {
    const macAddress = req.body.mac;
    const broadcastIP = req.body.broadcastIP || "192.168.1.255"; // Default broadcast IP
    const macParts = macAddress.split(":").map(part => parseInt(part, 16));
    
    if (macParts.length !== 6) {
        return res.status(400).send("Invalid MAC address format");
    }

    // Create the magic packet
    const magicPacket = Buffer.alloc(102, 0xFF);
    for (let i = 1; i <= 16; i++) {
        magicPacket.set(macParts, i * 6);
    }

    // Send the magic packet
    const socket = dgram.createSocket("udp4");
    socket.send(magicPacket, 9, broadcastIP, err => {
        socket.close();
        if (err) {
            console.error(err);
            return res.status(500).send("Failed to send magic packet");
        }
        res.send("Magic packet sent successfully!");
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
