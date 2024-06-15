// middlewares/isAuthenticated.js
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

module.exports = async (req, res, next) => {
    const bearerToken = req.headers['authorization'] || "";

    console.log("Authorization header:", bearerToken); // Log header authorization

    if (!bearerToken) {
        console.log("No token provided");
        return res.status(401).send({ message: "Unauthorized - No token provided." });
    } else if (!bearerToken.startsWith("Bearer ")) {
        console.log("Invalid token format");
        return res.status(401).send({ message: "Unauthorized - Invalid token format." });
    }

    const accessToken = bearerToken.replace("Bearer ", "");
    try {
        const payload = jwt.verify(accessToken, JWT_SECRET_KEY);
        console.log("Token payload:", payload); // Log token payload
        const user = await User.findByPk(payload.id);

        if (!user) {
            console.log("No user data found in token");
            return res.status(401).send({ message: "Unauthorized - No user data found in token." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Invalid token", error); // Log error
        return res.status(401).send({ message: "Unauthorized - Invalid token." });
    }
}; 