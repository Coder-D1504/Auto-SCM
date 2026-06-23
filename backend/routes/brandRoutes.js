const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getBrands, getBrandById,
    createBrand, updateBrand, deleteBrand,
    updateBrandLogo
} = require('../controllers/brandController');
const verifyToken    = require('../middlewares/authMiddleware');
const authorizeRole  = require('../middlewares/roleMiddleware');

// Multer setup for brand logo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images/brands/'));
    },
    filename: (req, file, cb) => {
        const clean = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, `${Date.now()}-${clean}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB

// ── Public ───────────────────────────────────────────
router.get('/',     getBrands);
router.get('/:id',  getBrandById);

// ── Admin only ───────────────────────────────────────
router.post('/',
    verifyToken, authorizeRole('ADMIN'),
    createBrand
);

router.put('/:id',
    verifyToken, authorizeRole('ADMIN'),
    updateBrand
);

router.delete('/:id',
    verifyToken, authorizeRole('ADMIN'),
    deleteBrand
);

router.post('/:id/uploadLogo',
    verifyToken, authorizeRole('ADMIN'),
    upload.single('brand_logo'),
    updateBrandLogo
);

module.exports = router;
