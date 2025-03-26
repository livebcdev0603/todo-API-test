const app = require('./src/app');
const express = require('express');
require('dotenv').config();
const { logger } = require("./utils/auditLogger");
const { setupCronJobs } = require('./utils/cronJobs');
const requestLogger = require('./src/middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(requestLogger);

//Global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if(statusCode >= 500) {
        logger.error('Server Error', {
            error: err.message,
            satck: process.env.NODE_ENV === 'production' ? undefined : err.stack,
            path: req.path,
            method: req.method,
            userId: req.user?.id || 'anonymous'
        });
    } else {
        logger.warn('Client Error', {
            error: err.message,
            path: req.path,
            method: req.method,
            statusCode,
            userId: req.user?.id || 'anonymous'
        });
    }
    res.status(statusCode).json({
        error: {
          message: process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Internal server error'
            : err.message
        }
      });
})

const server = http.createServer(app);

let cronJobs;
server.listen(PORT, () => {
    logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
    });

    cronJobs = setupCronJobs({
        logRotationEnabled: process.env.LOG_ROTATION_ENABLED !== 'false',
        logRotationScheule: process.env.LOG_ROTATION_SCHEDULE || "0 0 * * *",
        logRetentionDays: parseInt(process.env.LOG_RETENTION_DAYS || '30')
    });
});

const gracefulShutDown = (signal) => {
    return () => {
        logger.info(`Received ${signal}. Starting graceful Shutdown....`);

        server.close(() => {
            logger.info('HTTP server closed');

            if(cronJobs) {
                const { stopCronJobs } = require('./utils/cronJobs');
                stopCronJobs(cronJobs);
            }

            logger.info('Graceful shutdown completed');
            process.exit(0);
        });

        setTimeout(() => {
            logger.warn('forcing server shudown after timeout');
            process.exit(1);
        }, 3000);
    }
}

process.on('SIGTERM', gracefulShutDown('SIGTERM'));
process.on('SIGINT', gracefulShutDown('SIGINT'));

process.on('uncaughtException', (error) => {
    logger.fatal('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    });

    setTimeout(() => {
        process.exit(1);
    }, 1000)
})

process.on('unhandledRejection', (reason, promise) => {
    logger.fatal('Unhandled Promise Rejection', {
        reason: reason?.message || reason,
        stack: reason?.stack
    });

})

module.exports = server;