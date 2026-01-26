const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require("socket.io");

// Load config
dotenv.config();

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev
        methods: ["GET", "POST"]
    }
});

const path = require('path'); // Add path module

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the parent directory (frontend)
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/livestreams', require('./routes/livestreamRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/logs', require('./routes/auditRoutes'));

const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, '/uploads')));

// Socket.io for Real-time Chat
const ChatMessage = require('./models/chatModel'); // Import model

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('send_message', async (data) => {
        // Save to DB
        try {
            const newMessage = new ChatMessage({
                user: data.user,
                text: data.text,
                livestream: data.livestreamId // Ensure client sends this
            });
            await newMessage.save();

            // Broadcast to room if provided, else global
            if (data.livestreamId) {
                io.to(data.livestreamId).emit('receive_message', data);
            } else {
                io.emit('receive_message', data);
            }
        } catch (error) {
            console.error('Error saving chat message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
