const jwt = require('jsonwebtoken');
const { User } = require('../models');
const secretKey = process.env.JWT_SECRET_KEY;

const verifyToken = async (req, res, next) => {
    const token = req.query.token || req.headers['authorization'];

    if (!token) {
        console.log("Token tidak disediakan.");
        return res.status(400).send({ message: "Token tidak disediakan." });
    }

    try {
        const payload = jwt.verify(token, secretKey);
        const user = await User.findOne({ where: { email: payload.email, verification_token: token } });

        if (!user) {
            console.log("Token verifikasi tidak valid atau user tidak ditemukan.");
            return res.status(400).send({ message: "Token verifikasi tidak valid." });
        }

        user.is_verified = true;
        user.verification_token = null;
        await user.save();

        console.log("User berhasil diverifikasi.");
        next();
    } catch (error) {
        console.error("Error during verification:", error);
        return res.status(500).send({ message: "Terjadi kesalahan saat verifikasi email." });
    }
};

module.exports = verifyToken;

