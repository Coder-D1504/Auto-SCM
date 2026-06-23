const express = require('express');
const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getAllBookings,
    updateBookingStatus
} = require('../controllers/bookingController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

// User Routes
router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getUserBookings);

// Admin Routes
router.get('/', verifyToken, authorizeRole('ADMIN'), getAllBookings);
router.put('/:id/status', verifyToken, authorizeRole('ADMIN'), updateBookingStatus);

module.exports = router;
