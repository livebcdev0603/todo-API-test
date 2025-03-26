const { auditLog } = require('./auditLogger');

const dbAuditLogger = {
  logCreate: (model, data, userId) => {
    auditLog(`${model} created`, userId, {
      model,
      data: sanitizeData(data),
      operation: 'CREATE'
    });
  },
  
  logUpdate: (model, id, changes, userId) => {
    auditLog(`${model} updated`, userId, {
      model,
      id,
      changes: sanitizeData(changes),
      operation: 'UPDATE'
    });
  },
  
  logDelete: (model, id, userId) => {
    auditLog(`${model} deleted`, userId, {
      model,
      id,
      operation: 'DELETE'
    });
  },
  
  logRead: (model, query, userId) => {
    auditLog(`${model} read`, userId, {
      model,
      query: sanitizeData(query),
      operation: 'READ'
    });
  }
};

function sanitizeData(data) {
    if (!data) return {};
    
    const sanitized = { ...data };  

    const sensitiveFields = ['password', 'token'];
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

module.exports = dbAuditLogger;