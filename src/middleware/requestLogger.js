const { logger } = require("../utils/auditLogger");

const requestLogger = (req, res, next) => {
    const originalSend = res.send;

    const startTime = Date.now();

    const requestLog = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'unauthenticated'
    }

    res.send = (body) => {
        const responseTime = Date.now() - startTime;
        
        const responseLog = {
            ...requestLog,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`
        }

        if(res.statusCode >= 500) {
            logger.error('HTTP Request Error', responseLog);
        } else if(res.statusCode >= 400) {
            logger.warn('HTTP Request Warning', responseLog);
        } else {
            logger.info('HTTP Request', responseLog);
        }

        originalSend.call(this.body);
        return this;
    }
    next();
}

module.exports = requestLogger;