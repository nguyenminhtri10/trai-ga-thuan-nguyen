const path = require('path');
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Config Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'trai-ga-thuan-nguyen', // Tên folder trên Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage: storage });

// Single file upload
router.post('/', upload.single('image'), (req, res) => {
    try {
        // Cloudinary returns the full URL in req.file.path
        res.status(200).send(req.file.path);
    } catch (error) {
        console.error(error);
        res.status(500).send('Upload Failed');
    }
});

// Multiple file upload
router.post('/multiple', upload.array('images', 10), (req, res) => {
    try {
        // Return array of paths
        const paths = req.files.map(file => file.path);
        res.status(200).send(paths);
    } catch (error) {
        console.error(error);
        res.status(500).send('Upload Failed');
    }
});

module.exports = router;
