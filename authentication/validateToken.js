const jwt = require('jsonwebtoken');


module.exports = function(req, res, next){
    console.log(req.headers);
    //get token from headers
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
    //verify given token to decode it, get user who is validated with the token
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user=user;
        next();
    })
};