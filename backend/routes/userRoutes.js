const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

router.get('/preferences', verifyToken, async (req, res, next) => {
    try {
        const prefs = await User.getPreferences(req.user.id);
        res.json(prefs || { preferred_fuel: '', budget_limit: '' });
    } catch (err) { next(err); }
});

router.put('/preferences', verifyToken, async (req, res, next) => {
    try {
        await User.setPreferences(req.user.id, req.body);
        res.json({ message: 'Preferences updated successfully' });
    } catch (err) { next(err); }
});

router.get('/dashboard-summary', verifyToken, async (req, res, next) => {
    try {
        const summary = await User.getDashboardSummary(req.user.id);
        res.json(summary);
    } catch (err) { next(err); }
});

router.get('/', verifyToken, authorizeRole('ADMIN'), async (req, res, next) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
