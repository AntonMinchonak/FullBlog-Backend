import jwt from "jsonwebtoken";

export default (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/bearer\s?/i, '')
    if (token) {
        try {
            const decoded = jwt.verify(token, 'secret123')
            
            req.userId = decoded._id
            // res.json({token:decoded})
            next()
        } catch (err) {
            return res.status(403).json({
               message: "No access mazafaka111!",
             });
       } 
    } else {
        return res.status(403).json({
            message:'No access mazafaka!'
        })
    }

}