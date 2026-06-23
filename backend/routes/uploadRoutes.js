const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

// Only Admins can upload images
router.post('/', verifyToken, authorizeRole('ADMIN'), upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // The file is served statically from /uploads
        // Instead of hardcoding localhost:5000, return generic path so it works everywhere
        const imageUrl = `/uploads/${req.file.filename}`;
        
        res.status(200).json({ url: imageUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
