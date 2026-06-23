const BookingService = require('../services/bookingService');

const createBooking = async (req, res, next) => {
    try {
        const result = await BookingService.createBooking(req.user.id, req.body.variant_id);
        res.status(201).json(result);
    } catch (err) {
        if (err.message === 'Variant ID is required') return res.status(400).json({ message: err.message });
        next(err);
    }
};

const getUserBookings = async (req, res, next) => {
    try {
        const bookings = await BookingService.getUserBookings(req.user.id);
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};

const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await BookingService.getAllBookings();
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};

const updateBookingStatus = async (req, res, next) => {
    try {
        const result = await BookingService.updateBookingStatus(req.params.id, req.body.status);
        res.json(result);
    } catch (err) {
        if (err.message === 'Invalid status') return res.status(400).json({ message: err.message });
        next(err);
    }
};

module.exports = { createBooking, getUserBookings, getAllBookings, updateBookingStatus };
