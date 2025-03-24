const { sequelize } = require("../src/config/database");

// Before all tests
beforeAll(async() => {
    // Sync database in force mode for testing (recreates table)
    await sequelize.sync({ force: true });
})

//After all tests
afterAll(async() => {
    // Close the database connection
    await sequelize.close();
})