module.exports = (shouldAdmin) => (req, res, next) => {
    if (req.user.is_admin == shouldAdmin) {
        return next()
    }
    
    return res.sendStatus(403)
};