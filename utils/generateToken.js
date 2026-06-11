import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    // We package the user's database ID into the token, sign it with our secret key, 
    // and set it to expire in 30 days so they don't stay logged in forever.
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export default generateToken;