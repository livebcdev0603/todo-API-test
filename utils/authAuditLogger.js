const { auditLog } = require('./auditLogger');

const authAuditLogger = {
  logLogin: (userId, success, ipAddress) => {
    auditLog(success ? 'User login successful' : 'User login failed', userId, {
        ipAddress,
        success,
        event: 'LOGIN'
    });
  },
  
  logLogout: (userId, ipAddress) => {
    auditLog('User Logout', userId, {
        ipAddress,
        event: 'LOGOUT'
    });
  },
  
  logPasswordChange: (userId, ipAddress) => {
    auditLog('Password Changed', userId, {
        ipAddress,
        event: "PASSWORD_CHANGE"
    });
  },
  
  logPasswordReset: (userId, ipAddress) => {
    auditLog('Password reset requested', userId, {
        ipAddress,
        event: 'PASSWORD_RESET'
    });
  },

  logAccessDenied: (userId, resource, ipAddress) => {
    auditLog('Access denied', userId, {
        resource,
        ipAddress,
        event: 'ACCESS_DENIED'
    });
  }
};

module.exports = authAuditLogger;