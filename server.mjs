import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Server IP and Port
const SERVER_IP = '185.248.134.11';
const SERVER_PORT = '30120';
const SERVER_URL = `http://${SERVER_IP}:${SERVER_PORT}/players.json`; // Update with actual endpoint if different

app.use(express.static('public'));

app.get('/api/players', async (req, res) => {
    try {
        const response = await fetch(SERVER_URL);
        const players = await response.json();
        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
