const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

module.exports = async (req, res, next) => {
    const bearerToken = req.headers['authorization'] || "";

    if (!bearerToken) {
        return res.status(401).send({ message: "Unauthorized - No token provided." });
    } else if (!bearerToken.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized - Invalid token format." });
    }

    const accessToken = bearerToken.replace("Bearer ", "");
    try {
        const payload = jwt.verify(accessToken, JWT_SECRET_KEY);
        const user = await User.findByPk(payload.id);

        if (!user) {
            return res.status(401).send({ message: "Unauthorized - No user data found in token." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send({ message: "Unauthorized - Invalid token." });
    }
};
