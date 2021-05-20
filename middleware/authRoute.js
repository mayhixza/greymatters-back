const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authToken = req.cookies.verify;
    if (!authToken) {
        res.redirect("/login")
    } else {
        try {        
            const verified = jwt.verify(authToken, process.env.JWT_SECRET);
            req.user = verified;
        } catch(err) {
            console.log(err);
            res.status(400);
        }
        next();
    } 
}