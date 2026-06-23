const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    create: async (name, email, password, role = 'USER') => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        return query(sql, [name, email, hashedPassword, role]);
    },

    findByEmail: async (email) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const results = await query(sql, [email]);
        return results[0];
    },

    findById: async (id) => {
        const sql = 'SELECT id, name, email, role FROM users WHERE id = ?';
        const results = await query(sql, [id]);
        return results[0];
    },

    getAll: async () => {
        const sql = 'SELECT id, name, email, role, created_at FROM users';
        return query(sql);
    },

    getPreferences: async (id) => {
        const sql = 'SELECT preferred_fuel, budget_limit FROM user_preferences WHERE user_id = ?';
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    setPreferences: async (id, data) => {
        const { preferred_fuel, budget_limit } = data;
        const sql = `
            INSERT INTO user_preferences (user_id, preferred_fuel, budget_limit) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE preferred_fuel = VALUES(preferred_fuel), budget_limit = VALUES(budget_limit)
        `;
        return query(sql, [id, preferred_fuel || null, budget_limit || null]);
    },
    
    getDashboardSummary: async (userId) => {
        const bookingsSql = 'SELECT COUNT(*) as total, SUM(CASE WHEN status = "CONFIRMED" THEN 1 ELSE 0 END) as confirmed FROM bookings WHERE user_id = ?';
        const activitySql = `
            SELECT a.action, a.created_at, v.id as vehicle_id, m.name as model_name, b.name as brand_name
            FROM user_activity a
            JOIN variants v ON a.entity_id = v.id
            JOIN models m ON v.model_id = m.id
            JOIN brands b ON m.brand_id = b.id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
            LIMIT 5
        `;
        
        const [bookingStats] = await query(bookingsSql, [userId]);
        const activity = await query(activitySql, [userId]);
        const prefs = await User.getPreferences(userId);
        
        return {
            stats: {
                totalBookings: bookingStats.total || 0,
                confirmedBookings: bookingStats.confirmed || 0
            },
            recentActivity: activity,
            preferences: prefs
        };
    }
};

module.exports = User;
