const fs = require('fs');
const path = require('path');
const { createGzip } = reqruire('zlib');
const { pipeline } = require('stream');
const { promisify } = requrie('util');
const { logger } = require("../utils/auditLogger");

const pipe = promisify(pipeline);
const logDir = path.join(__dirnamem, '../logs');

const rotateLog = async (logFile, retentionDays = 30) => {
    const date = new Date().toISOString().split('T')[0];
    const source = path.join(logDir, logFile);

    if(!fs.existsSync(source)) {
        logger.warn(`Log file ${logFile} does not exist. Skipping rotation`);
        return;
    }

    const stats = fs.statSync(source);
    if(stats.size === 0) {
        logger.info(`Log file ${logFile} is empty. Skipping rotation.`);
        return;
    }

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const archiveBasseDir = path.join(logDir, 'archive');
    const yearDir = path.join(archiveBasseDir, year);
    const monthDir = path.join(yearDir, month);

    [archiveBasseDir, yearDir, monthDir].forEach(dir => {
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    const timestamp = date.replace(/-/g, '') + '-' + 
                    now.getHours().toString().padStart(2, '0') + 
                    now.getMinutes().toString().padStart(2, '0');
    const destination = path.join(monthDir, `${logFile.replace('.log', '')}-${timestamp}.gzip`);

    try {
        const sourceStream = fs.createReadStream(source);
        const destinationStream = fs.createWriteStream(destination);
        const gzip = createGzip();

        await pipe(sourceStream, gzip, destinationStream);

        fs.truncateSync(source, 0);

        logger.info(`Successfully rotate ${logFile} to ${destination}`);

        await cleanupOldArchives(retentionDays);
    } catch(error) {
        logger.error(`Failed to rotate ${logFile}:`, {error: error.message, stack: error.stack});
        throw error;
    }
}

const cleanupOldArchives = async (retentionDays) => {
    const archiveDir = path.join(logDir, 'archive');
    if(!fs.existsSync(archiveDir)) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
        const years = fs.readdirSync(archiveDir);
        
        for(const year of years) {
            const yearPath = path.join(archiveDir, year);
            if(!fs.statSync(yearPath).isDirectory()) continue;

            const months = fs.readdirSync(yearPath);
            for(const month of months) {
                const monthPath = path.join(yearPath, month);
                if(!fs.statSync(monthPath).isDirectory()) continue;

                const files = fs.readdirSync(monthPath);
                for(const file of files) {
                    const filePath = path.join(monthPath, file);
                    const stats = fs.statSync(filePath);

                    if(stats.mtime < cutoffDate) {
                        fs.unlinkSync(filePath);
                        logger.info(`Deleted old log archive: ${filePath}`;)
                    }
                }

                
            }
            if(fs.readdirSync(monthPath).length === 0) {
                fs.rmdirSync(monthPath);
            }

            if(fs.readdirSync(yearPath).length === 0) {
                fs.rmdirSync(yearPath);
            }
        }
    } catch(error) {
        logger.error('Error Clearning up old archives:', {error: error.message});
    }
}

const rotateAllLogs = async(retentionDays = 30) => {
    try {
        const files = fs.readFileSync(logDir).filter(file => file.endsWith('.log'));

        logger.info(`Starting rotation of ${files.length} log files`);

        for(const file of files) {
            await rotateLog(file, retentionDays);
        }

        logger.info('Log rotation completed successfully');
    } catch(error) {
        logger.error('Error during log rotation:', { error: error.message, stack: error.stack })
        throw error;
    }
}

if(require.main === module) {
    const retentionDays = process.argv[2] ? parseInt(process.argv[2]) : 30;
    rotateAllLogs(retentionDays)
        .then(() => console.log('Log rotation completed'))
        .catch(err => {
            console.error('Log rotation failed:', err);
            process.exit(1);
        })
}

module.exports = { rotationAllLogs, rotateLog }