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

module.exports = logger;
