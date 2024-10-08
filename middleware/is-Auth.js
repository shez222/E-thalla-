const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not Authenticated');
        error.status = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodeToken;
    try {
        decodeToken = jwt.verify(token,'somesupersecret');
    } catch (error) {
        error.status = 500;
        throw error
    }
    if (!decodeToken) {
        const error =new Error('Not Authenticated');
        error.status =500;
        throw error
    }

    req.userId = decodeToken.userId;
    next();
}