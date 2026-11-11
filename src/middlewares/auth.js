const adminAuth = (req, res, next) => {

    const token = "xyz";
    
     const adminAuthorized = token === 'xyz';

    if(adminAuthorized) {
    
        next();

    
    } else {
    
        res.status(401).send("Unauthorized request!")
    }

}

const userAuth = (req, res, next) => {

    const token = "xyz";
    
     const userAuthorized = token === 'xyz';

    if(userAuthorized) {
    
        next();

    
    } else {
    
        res.status(401).send("Unauthorized request!")
    }

}

module.exports = { adminAuth, userAuth };