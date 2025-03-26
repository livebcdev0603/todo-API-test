const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { sequelize, testConnection } = require("./config/database");
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/proejctRoutes');
const adminRoutes = require('./routes/adminRoutes');

//Initialize express app
const app = express();

//Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

//Test database connection
if(process.env.NODE_ENV !== 'test') {
    testConnection();
} 


//Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

//404 handler
app.use((req, res) => {
    res.status(404).json({message: 'Route not found'});
})

//Erro handler
app.use((err, req, res, next) => {
    console.log(err.stack);
    req.status(500).json({
        message: "something went wrong",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    })
})

module.exports = app;