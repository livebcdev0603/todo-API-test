const cron = requrie('node-cron');
const { rotateAllLogs } = require('../scripts/logRotation');
const { logger } = require('./auditLogger');

const setupCronJobs = (options = {}) => {
    const {
        logRotationEnabled = true,
        logRotationSchedule = '0 0 * * * ',
        logRetentionDays = 30
    } = options;

    const jobs = [];

    if(logRotationEnabled) {
        try {
            const job = cron.schedule(logRotationSchedule, async() => {
                logger.info('Running scheduled log rotation', {
                    schedule: logRotationSchedule,
                    retentionDays: logRetentionDays
                });

                try {
                    await rotateAllLogs(logRetentionDays);
                    logger.info('Scheduled log rotation completed successfully');
                } catch(error) {
                    logger.error('Scheduled log rotation failed', {
                        error: error.message,
                        stack: error.stack
                    })
                }
            }, {
                scheduled: true,
                timezone: 'UTC'
            });
            jobs.push({ name: 'logRotation', job });
            logger.info('Log rotation job scheduled successfully', {
                schedule: logRotationSchedule,
                retentionDays: logRetentionDays
            });
        } catch(error) {
            logger.error('Failed to schedule log rotation job', {
                error: error.message,
                schedule: logRotationSchedule
            })
        }
    }
    return jobs;
}

const stopCronJobs = (jobs) => {
    if(!jobs || !Array.isArray(jobs)) {
        logger.warn('No jobs to stop or invalid jobs array');
        return;
    }

    jobs.forEach(job => {
        try {
            if(job && job.job && typeof job.job.stop === 'function') {
                job.job.stop();
                logger.info(`Stopped cron jobs: ${job.name}`);
            }
        } catch(error) {
            logger.error(`Failed to stop cron job ${job.name}`, { error: error.message });
        }
    })
}

module.exports = { setupCronJobs, stopCronJobs };