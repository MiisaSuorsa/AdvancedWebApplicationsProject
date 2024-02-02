const jwt = require('jsonwebtoken');


module.exports = function(req, res, next){
    console.log(req.headers);
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    let token;
    if(authHeader){
        token = authHeader.split(" ")[1];
    } else {
        token = null;
    }
    if (token == null) return res.sendStatus(401);
    console.log("token found");
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user=user;
        next();
    })
};