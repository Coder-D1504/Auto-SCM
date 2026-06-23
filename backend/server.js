const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorMiddleware');
const path = require('path');

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Auto-SCM API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const userRoutes = require('./routes/userRoutes');
const brandRoutes = require('./routes/brandRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/bookings', bookingRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

// Error Middleware
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('join_session', (sessionId) => {
        socket.join(sessionId);
    });

    socket.on('update_compare', ({ sessionId, ids }) => {
        // Broadcast the update to everyone else in the same session room
        socket.to(sessionId).emit('compare_updated', ids);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
