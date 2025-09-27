require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const { logger, readGroups, readMessage, delay, getRandomDelay } = require('./utils');

class WhatsAppScheduler {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'slc-automation'
      }),
      puppeteer: {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.setupEventHandlers();
    this.scheduleMessage();
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log('Scan the QR Code below with your phone:');
      console.log(qr);
      logger.info('QR Code generated for authentication');
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      logger.info('WhatsApp client connected and ready');
    });

    this.client.on('authenticated', () => {
      console.log('Authentication successful!');
      logger.info('WhatsApp authentication successful');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failed:', msg);
      logger.error(`Authentication failed: ${msg}`);
    });

    this.client.on('disconnected', (reason) => {
      console.log('Client was logged out:', reason);
      logger.warn(`Client disconnected: ${reason}`);
    });
  }

  async sendToGroups() {
    try {
      const groups = readGroups(process.env.GROUPS_PATH || './groups.txt');
      const message = readMessage(process.env.MESSAGE_PATH || './message.txt');

      if (!groups.length) {
        logger.error('No groups found in groups.txt');
        return;
      }

      if (!message.trim()) {
        logger.error('No message found in message.txt');
        return;
      }

      logger.info(`Starting to send messages to ${groups.length} groups`);
      console.log(`Sending messages to ${groups.length} groups...`);

      const chats = await this.client.getChats();
      const groupChats = chats.filter(chat => chat.isGroup);

      let sentCount = 0;
      let failedCount = 0;

      for (const groupIdentifier of groups) {
        try {
          let targetGroup = null;
          
          // Check if it's an ID (contains @g.us) or a name
          if (groupIdentifier.includes('@g.us')) {
            // Search by ID (more accurate)
            targetGroup = groupChats.find(chat => chat.id._serialized === groupIdentifier);
          } else {
            // Search by name (fallback for old format)
            targetGroup = groupChats.find(chat => 
              chat.name.toLowerCase().includes(groupIdentifier.toLowerCase())
            );
          }

          if (targetGroup) {
            await targetGroup.sendMessage(message);
            sentCount++;
            logger.info(`Message sent to group: ${targetGroup.name} (${targetGroup.id._serialized})`);
            console.log(`✓ Sent to: ${targetGroup.name}`);
            
            // Random delay between messages for better security (15-20 seconds)
            const delayMs = getRandomDelay();
            console.log(`Waiting ${delayMs/1000} seconds before next message...`);
            await delay(delayMs);
          } else {
            failedCount++;
            const identifier = groupIdentifier.includes('@g.us') ? 'ID' : 'name';
            logger.warn(`Group not found by ${identifier}: ${groupIdentifier}`);
            console.log(`✗ Group not found: ${groupIdentifier}`);
          }
        } catch (error) {
          failedCount++;
          logger.error(`Failed to send to ${groupIdentifier}: ${error.message}`);
          console.log(`✗ Failed to send to ${groupIdentifier}: ${error.message}`);
        }
      }

      logger.info(`Message sending completed. Sent: ${sentCount}, Failed: ${failedCount}`);
      console.log(`\nCompleted! Sent: ${sentCount}, Failed: ${failedCount}`);

    } catch (error) {
      logger.error(`Error in sendToGroups: ${error.message}`);
      console.error('Error sending messages:', error.message);
    }
  }

  scheduleMessage() {
    const cronSchedule = process.env.CRON_SCHEDULE || '0 21 * * *';
    
    cron.schedule(cronSchedule, async () => {
      logger.info('Scheduled message sending started');
      console.log('Starting scheduled message sending...');
      await this.sendToGroups();
    });

    logger.info(`Message scheduled with cron: ${cronSchedule}`);
    console.log(`Messages scheduled daily at 9:00 PM (${cronSchedule})`);
  }

  async start() {
    try {
      await this.client.initialize();
    } catch (error) {
      logger.error(`Failed to initialize client: ${error.message}`);
      console.error('Failed to start WhatsApp client:', error.message);
    }
  }
}

// Start the application
const scheduler = new WhatsAppScheduler();
scheduler.start();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  logger.info('Application shutdown requested');
  await scheduler.client.destroy();
  process.exit(0);
});