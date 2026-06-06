const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', '..', 'vsmd-debug.log');

let logStream = null;

function getLogStream() {
    if (!logStream) {
        try {
            logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
        } catch (e) {
            // 静默失败
        }
    }
    return logStream;
}

function formatTime(date) {
    const pad = (n, len = 2) => String(n).padStart(len, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

function writeLog(level, ...args) {
    const timestamp = formatTime(new Date());
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [VSMD]`;
    const message = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
            try {
                return JSON.stringify(arg);
            } catch (e) {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');

    const logLine = `${prefix} ${message}\n`;

    const stream = getLogStream();
    if (stream) {
        stream.write(logLine);
    }

    return logLine;
}

const logger = {
    log: (...args) => writeLog('log', ...args),
    warn: (...args) => writeLog('warn', ...args),
    error: (...args) => writeLog('error', ...args),
    info: (...args) => writeLog('info', ...args),
    debug: (...args) => writeLog('debug', ...args),
    timing: (label, startTime) => {
        const end = Date.now();
        writeLog('info', `TIMING: ${label}`, end - startTime, 'ms');
        return end;
    }
};

module.exports = { logger };