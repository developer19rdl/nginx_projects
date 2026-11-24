const http    = require('http');
const express = require("express");
const { Server } = require('socket.io');
const { compareMACAddresses } = require('./app/config/validateMAC');
const app = express();
require('dotenv').config();
const cors = require('cors');
const path = require('path');
app.use(cors());
app.set('trust proxy', 1);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve the Images / public folder
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/public', express.static(path.join(process.cwd(), 'public')));

require('./app/service/mainRoutes')(app);

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

global.io = io;

io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.on('disconnect', () => console.log(`[Socket.IO] Client disconnected: ${socket.id}`));
});

const PORT = process.env.APP_PORT || 8005;
const HOST = process.env.APP_HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});


