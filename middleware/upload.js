const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage for the images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        // Determine upload folder based on fieldname
        if (file.fieldname === 'productImages') {
            uploadPath += 'products/';
        } else if (file.fieldname === 'avatar') {
            uploadPath += 'users/';
        } else if (file.fieldname === 'paymentProof') {
            uploadPath += 'payments/';
        }

        // Create directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// File filter to accept only images and pdf
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('File type not supported. Only images and PDFs are allowed.'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: process.env.UPLOAD_LIMIT || 10 * 1024 * 1024 }, // 10MB default
    fileFilter: fileFilter
});

module.exports = upload;
