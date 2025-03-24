const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

// Get all users
exports.getCurrentUser = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: {exclude: ['password_hash']}
      });
      
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

exports.getUserById = async(req, res) => {
    try {
        const { id } = req.params.id;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password_hash'] }
        })

        if(!user) {
            return res.status(400).json({message: 'User not found'});
        }

        return res.status(200).json(user);
    } catch(error) {
        console.error("Error fetching user:", error);
        return res.status(500), json({message: 'Server error', error: error.message})
    }
}

exports.createUser = async(req, res) => {
    try {
        const {name, email, password} = req.body;

        //Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if(existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = await User.create({
            name, 
            email, 
            password_hash: password
        });

        const userResponse = user.toJSON();
        delete userResponse.password_hash;

        return res.json(201).json(userResponse);
    } catch(error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}


exports.updateUser = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const user = await User.findByPk(id);
        if(!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        await user.update({name, email});

        const userResponse = user.toJSON();
        delete userResponse.password_hash;

        return res.json(200).json(userResponse);
    } catch(error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.deleteUser = async(req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if(!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        await user.destroy();

        return res.json(204).send();
    } catch(error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}