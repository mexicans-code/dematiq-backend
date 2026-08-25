const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

function shouldLog(level) {
  return LEVELS[level] !== undefined && LEVELS[level] <= LEVELS[LOG_LEVEL];
}

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

const logger = {
  error(message, meta) {
    if (!shouldLog('error')) return;
    console.error(formatMessage('error', message, meta));
  },
  warn(message, meta) {
    if (!shouldLog('warn')) return;
    console.warn(formatMessage('warn', message, meta));
  },
  info(message, meta) {
    if (!shouldLog('info')) return;
    console.log(formatMessage('info', message, meta));
  },
  debug(message, meta) {
    if (!shouldLog('debug')) return;
    console.log(formatMessage('debug', message, meta));
  },
};

const audit = {
  log(event, details) {
    if (!shouldLog('info')) return;
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      event,
      ...details,
    };
    console.log(`[AUDIT] ${JSON.stringify(entry)}`);
  },

  auth(event, userId, ip, success, meta = {}) {
    this.log(`AUTH_${event.toUpperCase()}`, { userId, ip, success, ...meta });
  },

  admin(event, userId, ip, meta = {}) {
    this.log(`ADMIN_${event.toUpperCase()}`, { userId, ip, ...meta });
  },

  dataAccess(event, userId, resource, meta = {}) {
    this.log(`DATA_${event.toUpperCase()}`, { userId, resource, ...meta });
  },

  security(event, severity, details) {
    this.log(`SECURITY_${event.toUpperCase()}`, { severity, ...details });
  },

  upload(event, userId, fileName, meta = {}) {
    this.log(`UPLOAD_${event.toUpperCase()}`, { userId, fileName, ...meta });
  },
};

module.exports = logger;
module.exports.audit = audit;