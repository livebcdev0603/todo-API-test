const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

//Login User
exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        // Find user by email
        const user = await User.findOne({ where: { email } })

        if(!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        //Check password
        const isPasswordValid = await User.validPassword(password);

        if(!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        //Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "your_secret_key",
            {expiresIn: "24h"}
        );

        // Return user info and token
        const { password_hash, ...userWithoutPassword } = user.toJSON();

        return res.status(200).json({
            user: userWithoutPassword,
            token
        });
    } catch(err) {
        console.error("Error during login: ", err);
        return res.status(500).json({message: 'server error', error: error.message});
    }
}

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: {exclude: ['password_hash']}
        })

        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch(err) {
        console.error('Error fecthing current user', err);
        return res.status(500).json({message: 'Server errror', error: err.message});
    }
}