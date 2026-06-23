const express = require('express');
const router = express.Router();
const {
    getVehicles,
    getVehicleDetail,
    compareVehicles,
    getRecommendations,
    getMetadata,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getDashboardStats
} = require('../controllers/vehicleController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

// Public
router.get('/', getVehicles);
router.get('/compare', compareVehicles);
router.get('/metadata', getMetadata);

// Protected
router.get('/recommendations', verifyToken, getRecommendations);

// Public Detail
router.get('/:id', getVehicleDetail);

// Admin Only
router.get('/dashboard/stats', verifyToken, authorizeRole('ADMIN'), getDashboardStats);
router.post('/', verifyToken, authorizeRole('ADMIN'), addVehicle);
router.put('/:id', verifyToken, authorizeRole('ADMIN'), updateVehicle);
router.delete('/:id', verifyToken, authorizeRole('ADMIN'), deleteVehicle);

module.exports = router;
