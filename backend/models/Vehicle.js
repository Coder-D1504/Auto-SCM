const { query } = require('../config/db');

const Vehicle = {
    // Types
    getAllTypes: async () => {
        return query('SELECT * FROM vehicle_types');
    },

    // Brands
    getBrandsByType: async (typeId) => {
        return query('SELECT * FROM brands WHERE vehicle_type_id = ?', [typeId]);
    },

    // Models
    getModelsByBrand: async (brandId) => {
        return query('SELECT * FROM models WHERE brand_id = ?', [brandId]);
    },

    getSearchableVehicles: async () => {
        const sql = `
          SELECT m.*, min_v.id as variant_id
          FROM models m
          JOIN (
            SELECT model_id, MIN(id) as id 
            FROM variants 
            GROUP BY model_id
          ) min_v ON m.id = min_v.model_id
        `;
        return query(sql);
    },

    // Variants (Full Vehicle Info)
    getVariantsByModel: async (modelId) => {
        return query('SELECT * FROM variants WHERE model_id = ?', [modelId]);
    },

    // Search & Filter
    searchVehicles: async (filters) => {
        let sql = `
      SELECT v.*, m.name as model_name, b.name as brand_name, vt.name as type_name, v.image_url as variant_image, m.image_url as model_image, b.image_url as brand_image
      FROM variants v
      JOIN models m ON v.model_id = m.id
      JOIN brands b ON m.brand_id = b.id
      JOIN vehicle_types vt ON b.vehicle_type_id = vt.id
      WHERE 1=1
    `;
        const params = [];

        if (filters.search) {
            sql += ' AND (b.name LIKE ? OR m.name LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters.type) {
            sql += ' AND vt.name = ?';
            params.push(filters.type);
        }

        if (filters.brand) {
            sql += ' AND b.name = ?';
            params.push(filters.brand);
        }

        if (filters.fuel) {
            sql += ' AND v.fuel_type = ?';
            params.push(filters.fuel);
        }

        if (filters.minPrice) {
            sql += ' AND v.price >= ?';
            params.push(filters.minPrice);
        }

        if (filters.maxPrice) {
            sql += ' AND v.price <= ?';
            params.push(filters.maxPrice);
        }

        if (filters.transmission) {
            sql += ' AND v.transmission = ?';
            params.push(filters.transmission);
        }

        if (filters.seating) {
            sql += ' AND v.seating_capacity >= ?';
            params.push(filters.seating);
        }

        return query(sql, params);
    },

    getRecommendations: async (userId) => {
        const userPrefsSql = 'SELECT preferred_fuel, budget_limit FROM user_preferences WHERE user_id = ?';
        const prefsResult = await query(userPrefsSql, [userId]);
        const prefs = prefsResult[0];

        let sql = `
          SELECT v.*, m.name as model_name, b.name as brand_name, vt.name as type_name, v.image_url as variant_image, m.image_url as model_image, b.image_url as brand_image
          FROM variants v
          JOIN models m ON v.model_id = m.id
          JOIN brands b ON m.brand_id = b.id
          JOIN vehicle_types vt ON b.vehicle_type_id = vt.id
          WHERE 1=1
        `;
        const params = [];

        if (prefs) {
            if (prefs.preferred_fuel) {
                sql += ' AND v.fuel_type = ?';
                params.push(prefs.preferred_fuel);
            }
            if (prefs.budget_limit && prefs.budget_limit > 0) {
                sql += ' AND v.price <= ?';
                params.push(prefs.budget_limit);
            }
        }

        sql += ' ORDER BY v.id DESC LIMIT 4';
        return query(sql, params);
    },

    getVehicleById: async (id) => {
        const sql = `
      SELECT v.*, m.name as model_name, b.name as brand_name, vt.name as type_name, b.id as brand_id, vt.id as type_id, v.image_url as variant_image, m.image_url as model_image, b.image_url as brand_image
      FROM variants v
      JOIN models m ON v.model_id = m.id
      JOIN brands b ON m.brand_id = b.id
      JOIN vehicle_types vt ON b.vehicle_type_id = vt.id
      WHERE v.id = ?
    `;
        const results = await query(sql, [id]);
        return results[0];
    },

    // Tracking / Activity
    logActivity: (userId, action, entityId) => {
        const sql = 'INSERT INTO user_activity (user_id, action, entity_id) VALUES (?, ?, ?)';
        // Use a generic catch so it doesn't fail the main request if logging fails
        return query(sql, [userId || null, action, entityId]).catch(err => console.error('Logging Error:', err));
    },

    // Comparison
    getComparison: async (ids) => {
        if (!ids || ids.length === 0) return [];
        const placeholders = ids.map(() => '?').join(',');
        const sql = `
      SELECT v.*, m.name as model_name, b.name as brand_name, vt.name as type_name, v.image_url as variant_image, m.image_url as model_image, b.image_url as brand_image
      FROM variants v
      JOIN models m ON v.model_id = m.id
      JOIN brands b ON m.brand_id = b.id
      JOIN vehicle_types vt ON b.vehicle_type_id = vt.id
      WHERE v.id IN (${placeholders})
    `;
        return query(sql, ids);
    },

    // CRUD for Admin (Simplified)
    createType: (name) => query('INSERT INTO vehicle_types (name) VALUES (?)', [name]),
    deleteType: (id) => query('DELETE FROM vehicle_types WHERE id = ?', [id]),

    createBrand: (name, typeId) => query('INSERT INTO brands (name, vehicle_type_id) VALUES (?, ?)', [name, typeId]),
    deleteBrand: (id) => query('DELETE FROM brands WHERE id = ?', [id]),

    createModel: (name, brandId) => query('INSERT INTO models (name, brand_id) VALUES (?, ?)', [name, brandId]),
    deleteModel: (id) => query('DELETE FROM models WHERE id = ?', [id]),

    createVariant: (data) => {
        const { model_id, fuel_type, price, engine, mileage, transmission, seating_capacity, description, image_url } = data;
        const sql = 'INSERT INTO variants (model_id, fuel_type, price, engine, mileage, transmission, seating_capacity, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        return query(sql, [model_id, fuel_type, price, engine, mileage, transmission, seating_capacity, description, image_url]);
    },

    updateVariant: (id, data) => {
        const { fuel_type, price, engine, mileage, transmission, seating_capacity, description, image_url } = data;
        const sql = 'UPDATE variants SET fuel_type=?, price=?, engine=?, mileage=?, transmission=?, seating_capacity=?, description=?, image_url=? WHERE id=?';
        return query(sql, [fuel_type, price, engine, mileage, transmission, seating_capacity, description, image_url, id]);
    },

    deleteVariant: (id) => query('DELETE FROM variants WHERE id = ?', [id]),

    // Stats
    getStats: async () => {
        const usersCount = await query('SELECT COUNT(*) as count FROM users');
        const vehiclesCount = await query('SELECT COUNT(*) as count FROM variants');
        const categoryBreakdown = await query(`
      SELECT vt.name, COUNT(v.id) as count
      FROM vehicle_types vt
      LEFT JOIN brands b ON vt.id = b.vehicle_type_id
      LEFT JOIN models m ON b.id = m.brand_id
      LEFT JOIN variants v ON m.id = v.model_id
      GROUP BY vt.name
    `);

        const mostViewed = await query(`
          SELECT v.id, m.name as model_name, b.name as brand_name, COUNT(a.id) as action_count
          FROM user_activity a
          JOIN variants v ON a.entity_id = v.id
          JOIN models m ON v.model_id = m.id
          JOIN brands b ON m.brand_id = b.id
          WHERE a.action = 'VIEW_VEHICLE'
          GROUP BY v.id, m.name, b.name
          ORDER BY action_count DESC LIMIT 5
        `);

        const mostCompared = await query(`
          SELECT v.id, m.name as model_name, b.name as brand_name, COUNT(a.id) as action_count
          FROM user_activity a
          JOIN variants v ON a.entity_id = v.id
          JOIN models m ON v.model_id = m.id
          JOIN brands b ON m.brand_id = b.id
          WHERE a.action = 'COMPARE_VEHICLES'
          GROUP BY v.id, m.name, b.name
          ORDER BY action_count DESC LIMIT 5
        `);

        const mostBooked = await query(`
          SELECT v.id, m.name as model_name, b.name as brand_name, COUNT(a.id) as action_count
          FROM user_activity a
          JOIN variants v ON a.entity_id = v.id
          JOIN models m ON v.model_id = m.id
          JOIN brands b ON m.brand_id = b.id
          WHERE a.action = 'BOOK_TEST_DRIVE'
          GROUP BY v.id, m.name, b.name
          ORDER BY action_count DESC LIMIT 5
        `);

        return {
            users: usersCount[0].count,
            vehicles: vehiclesCount[0].count,
            categories: categoryBreakdown,
            mostViewed,
            mostCompared,
            mostBooked
        };
    }
};

module.exports = Vehicle;
