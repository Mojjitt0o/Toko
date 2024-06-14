const express = require("express");
const router = require("./routers");
const { pinoHttp } = require('pino-http');
const verifyToken = require('./middlewares/verifyToken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Endpoint untuk verifikasi email - (untuk render tampilan verifikasi berhasil)
app.get('/verify-email', verifyToken, (req, res) => {
    res.sendFile(__dirname + '/views/verification-success.html');
});

app.use(router);

if (process.env.NODE_ENV !=='test'){
    app.use(pinoHttp())
}

app.use((req, res, next) => {
    return next({
        status: 404,
        message: 'No route to ' + req.path
    })
})

app.use((err, req, res, next) => {
    return res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        data: err.data
    })
})

module.exports = app;
