const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
    await next(); // route handler and come back

    clearHash(req.user.id)
}