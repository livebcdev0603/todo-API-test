const { exec } = require("child_process");
const util = require('util');
const execPromise = util.promisify(exec);

// Controller for database migrations
exports.runMigrations = async (req, res) => {
    try {
        const { stdout, stderr } = await execPromise("npm run db:migrate");

        if(stderr && !stderr.includes("Executing")) {
            return res.status(500).json({
                message: "Error running migrations",
                error: stderr
            });
        }

        return res.status(200).json({
            message: 'Migrations completed successfully',
            details: stdout
        })
    } catch(error) {
        console.error('Migration error:', error);
        return res.status(500).json({
            message: 'Error running migrations',
            error: error.message
        })
    }
}

// Rollback last migration
exports.rollbackMigration = async (req, res) => {
    try {
        const { stdout, stderr } = await execPromise("npm run db:migrate:undo");

        if(stderr && !stderr.includes("Executing")) {
            return res.status(500).json({
                message: "Error running back migrations",
                error: stderr
            });
        }

        return res.status(200).json({
            message: 'Migrations rollback completed successfully',
            details: stdout
        })
    } catch(error) {
        console.error('Rollback error:', error);
        return res.status(500).json({
            message: 'Error running back migrations',
            error: error.message
        })
    }
}

// Get migration status
exports.getMigrationStatus = async (req, res) => {
    try {
        const { stdout, stderr } = await execPromise("npx sequelize-cli db:migrate:status");

        if(stderr && !stderr.includes("Executing")) {
            return res.status(500).json({
                message: "Error getting migration status",
                error: stderr
            });
        }

        return res.status(200).json({
            message: 'Migration status retrieved successfully',
            details: stdout
        })
    } catch(error) {
        console.error('Status error:', error);
        return res.status(500).json({
            message: 'Error getting migration status',
            error: error.message
        })
    }
}