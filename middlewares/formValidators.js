const { body, validationResult } = require('express-validator');

// Error handler
const handleValidationErrors = (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        // Log error di server-side
        console.error('Form validation errors:', errors.array());

        // Error messages collector 
        const errorMessages = errors.array().map(error => error.msg);

        // Send error di client-side
        return res.status(400).json({
            success: false,
            messages: errorMessages
        })
    }
    next()
}


// Middleware untuk validasi pendaftaran
const validateRegister = [
    body('name').notEmpty().withMessage('Nama lengkap diperlukan'),
    body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password setidaknya harus 6 karakter'),
    handleValidationErrors
];

// Middleware untuk validasi login
const validateLogin = [
    body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
    body('password').notEmpty().withMessage('Password diperlukan'),
    handleValidationErrors
]

// Middleware untuk validasi update user
const validateUpdateUser = [

    body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
    body('newPassword').optional().isLength({ min: 6 }).withMessage('Password setidaknya harus 6 karakter'),
    body('oldPassword').optional().notEmpty().withMessage('Old Password Diperlukan'),
    handleValidationErrors
]

module.exports = {
    validateLogin,
    validateRegister,
    validateUpdateUser
}