const { query } = require('../config/db');
const Vehicle = require('../models/Vehicle');

const BookingService = {
    createBooking: async (userId, variantId) => {
        if (!variantId) throw new Error('Variant ID is required');
        const sql = 'INSERT INTO bookings (user_id, variant_id) VALUES (?, ?)';
        await query(sql, [userId, variantId]);
        Vehicle.logActivity(userId, 'BOOK_TEST_DRIVE', variantId).catch(() => {});
        return { message: 'Test drive booked successfully' };
    },
    getUserBookings: async (userId) => {
        const sql = `
            SELECT b.id, b.status, b.booking_date, 
                   v.id as variant_id, v.fuel_type, v.price, v.image_url as variant_image,
                   m.name as model_name, br.name as brand_name
            FROM bookings b
            JOIN variants v ON b.variant_id = v.id
            JOIN models m ON v.model_id = m.id
            JOIN brands br ON m.brand_id = br.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        `;
        return await query(sql, [userId]);
    },
    getAllBookings: async () => {
        const sql = `
            SELECT b.id, b.status, b.booking_date, 
                   u.name as user_name, u.email as user_email,
                   m.name as model_name, br.name as brand_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN variants v ON b.variant_id = v.id
            JOIN models m ON v.model_id = m.id
            JOIN brands br ON m.brand_id = br.id
            ORDER BY b.booking_date DESC
        `;
        return await query(sql);
    },
    updateBookingStatus: async (id, status) => {
        if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
            throw new Error('Invalid status');
        }
        const sql = 'UPDATE bookings SET status = ? WHERE id = ?';
        await query(sql, [status, id]);
        return { message: 'Booking status updated successfully' };
    }
};

module.exports = BookingService;
