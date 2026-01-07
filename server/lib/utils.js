import jwt from 'jsonwebtoken';
export const generateAuthToken = (userId) => {
    const token = jwt.sign({userId }, process.env.JWT_SECRET);
    
    return token;
}