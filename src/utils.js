const fs = require('fs-extra');
const path = require('path');
const winston = require('winston');

const logPath = process.env.LOG_PATH || './logs/app.log';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: logPath })
  ]
});

function readGroups(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#')); // Remove comments and empty lines
  } catch (err) {
    logger.error(`Failed to read groups: ${err}`);
    return [];
  }
}

function readMessage(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    logger.error(`Failed to read message: ${err}`);
    return '';
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomDelay() {
  const minDelay = parseInt(process.env.DELAY_RANGE_MIN) || 15000; // 15 seconds default
  const maxDelay = parseInt(process.env.DELAY_RANGE_MAX) || 20000; // 20 seconds default
  
  // Generate random delay between min and max
  const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  
  logger.info(`Using random delay: ${randomDelay}ms (${randomDelay/1000} seconds)`);
  return randomDelay;
}

module.exports = { logger, readGroups, readMessage, delay, getRandomDelay };
