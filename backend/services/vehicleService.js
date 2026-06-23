const Vehicle = require('../models/Vehicle');
const { query } = require('../config/db');

const VehicleService = {
    getVehicles: async (queryParams) => {
        return await Vehicle.searchVehicles(queryParams);
    },
    getVehicleDetail: async (id, userId = null) => {
        const vehicle = await Vehicle.getVehicleById(id);
        if (!vehicle) throw new Error('Vehicle not found');
        const variants = await Vehicle.getVariantsByModel(vehicle.model_id);
        Vehicle.logActivity(userId, 'VIEW_VEHICLE', vehicle.id).catch(() => {});
        return { ...vehicle, variants };
    },
    compareVehicles: async (ids, userId = null) => { 
        if (!ids) throw new Error('No vehicle IDs provided');
        const idList = ids.split(',').map(id => parseInt(id));
        const comparisons = await Vehicle.getComparison(idList);
        idList.forEach(id => Vehicle.logActivity(userId, 'COMPARE_VEHICLES', id).catch(() => {}));
        return comparisons;
    },
    getRecommendations: async (userId) => {
        return await Vehicle.getRecommendations(userId);
    },
    getMetadata: async () => {
        const types = await Vehicle.getAllTypes();
        const brands = await query('SELECT * FROM brands');
        const models = await Vehicle.getSearchableVehicles();
        return { types, brands, models };
    },
    addVehicle: async (data) => {
        const result = await Vehicle.createVariant(data);
        return { message: 'Vehicle added', id: result.insertId };
    },
    updateVehicle: async (id, data) => {
        await Vehicle.updateVariant(id, data);
        return { message: 'Vehicle updated' };
    },
    deleteVehicle: async (id) => {
        await Vehicle.deleteVariant(id);
        return { message: 'Vehicle deleted' };
    },
    getDashboardStats: async () => {
        return await Vehicle.getStats();
    }
};

module.exports = VehicleService;
