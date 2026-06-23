const { query } = require('../config/db');
const fs = require('fs');
const path = require('path');

/* ── GET all brands (with optional type filter) ── */
const getBrands = async (req, res, next) => {
    try {
        const { type } = req.query;
        let sql = `
            SELECT b.id, b.name, b.image_url AS logo, b.vehicle_type_id,
                   vt.name AS type
            FROM brands b
            JOIN vehicle_types vt ON b.vehicle_type_id = vt.id
        `;
        const params = [];
        if (type) { sql += ' WHERE vt.name = ?'; params.push(type); }
        sql += ' ORDER BY vt.name, b.name';
        res.json(await query(sql, params));
    } catch (err) { next(err); }
};

/* ── GET single brand ── */
const getBrandById = async (req, res, next) => {
    try {
        const rows = await query(
            `SELECT b.id, b.name, b.image_url AS logo, b.vehicle_type_id, vt.name AS type
             FROM brands b JOIN vehicle_types vt ON b.vehicle_type_id = vt.id
             WHERE b.id = ?`, [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: 'Brand not found' });
        res.json(rows[0]);
    } catch (err) { next(err); }
};

/* ── CREATE brand ── */
const createBrand = async (req, res, next) => {
    try {
        const { name, vehicle_type_id } = req.body;
        if (!name || !vehicle_type_id)
            return res.status(400).json({ message: 'name and vehicle_type_id are required' });

        const result = await query(
            'INSERT INTO brands (name, vehicle_type_id) VALUES (?, ?)',
            [name.trim(), vehicle_type_id]
        );
        res.status(201).json({ message: 'Brand created', id: result.insertId });
    } catch (err) { next(err); }
};

/* ── UPDATE brand name / type ── */
const updateBrand = async (req, res, next) => {
    try {
        const { name, vehicle_type_id } = req.body;
        const { id } = req.params;
        if (!name || !vehicle_type_id)
            return res.status(400).json({ message: 'name and vehicle_type_id are required' });

        await query(
            'UPDATE brands SET name = ?, vehicle_type_id = ? WHERE id = ?',
            [name.trim(), vehicle_type_id, id]
        );
        res.json({ message: 'Brand updated' });
    } catch (err) { next(err); }
};

/* ── DELETE brand ── */
const deleteBrand = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch logo path to clean up file if it's locally stored
        const rows = await query('SELECT image_url FROM brands WHERE id = ?', [id]);
        if (rows.length && rows[0].image_url && rows[0].image_url.startsWith('/public')) {
            const filePath = path.join(__dirname, '..', rows[0].image_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await query('DELETE FROM brands WHERE id = ?', [id]);
        res.json({ message: 'Brand deleted' });
    } catch (err) { next(err); }
};

/* ── UPLOAD / REPLACE brand logo ── */
const updateBrandLogo = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!req.file)
            return res.status(400).json({ message: 'No image provided' });

        // Remove old logo file if locally stored
        const existing = await query('SELECT image_url FROM brands WHERE id = ?', [id]);
        if (existing.length && existing[0].image_url && existing[0].image_url.startsWith('/public')) {
            const old = path.join(__dirname, '..', existing[0].image_url);
            if (fs.existsSync(old)) fs.unlinkSync(old);
        }

        const localDbPath = `/public/images/brands/${req.file.filename}`;
        await query('UPDATE brands SET image_url = ? WHERE id = ?', [localDbPath, id]);
        res.json({ image_url: localDbPath, message: 'Brand logo updated' });
    } catch (err) { next(err); }
};

module.exports = { getBrands, getBrandById, createBrand, updateBrand, deleteBrand, updateBrandLogo };
