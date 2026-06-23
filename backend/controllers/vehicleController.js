const VehicleService = require('../services/vehicleService');

const getVehicles = async (req, res, next) => {
    try {
        const vehicles = await VehicleService.getVehicles(req.query);
        res.json(vehicles);
    } catch (err) { next(err); }
};

const getVehicleDetail = async (req, res, next) => {
    try {
        const userId = req.user?.id || null;
        const detail = await VehicleService.getVehicleDetail(req.params.id, userId);
        res.json(detail);
    } catch (err) {
        if (err.message === 'Vehicle not found') return res.status(404).json({ message: err.message });
        next(err);
    }
};

const compareVehicles = async (req, res, next) => {
    try {
        const comparisons = await VehicleService.compareVehicles(req.query.ids);
        res.json(comparisons);
    } catch (err) {
        if (err.message === 'No vehicle IDs provided') return res.status(400).json({ message: err.message });
        next(err);
    }
};

const getRecommendations = async (req, res, next) => {
    try {
        const recommendations = await VehicleService.getRecommendations(req.user.id);
        res.json(recommendations);
    } catch (err) { next(err); }
};

const getMetadata = async (req, res, next) => {
    try {
        const metadata = await VehicleService.getMetadata();
        res.json(metadata);
    } catch (err) { next(err); }
};

const addVehicle = async (req, res, next) => {
    try {
        const result = await VehicleService.addVehicle(req.body);
        res.status(201).json(result);
    } catch (err) { next(err); }
};

const updateVehicle = async (req, res, next) => {
    try {
        const result = await VehicleService.updateVehicle(req.params.id, req.body);
        res.json(result);
    } catch (err) { next(err); }
};

const deleteVehicle = async (req, res, next) => {
    try {
        const result = await VehicleService.deleteVehicle(req.params.id);
        res.json(result);
    } catch (err) { next(err); }
};

const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await VehicleService.getDashboardStats();
        res.json(stats);
    } catch (err) { next(err); }
};

module.exports = {
    getVehicles, getVehicleDetail, compareVehicles, getRecommendations,
    getMetadata, addVehicle, updateVehicle, deleteVehicle, getDashboardStats
};
