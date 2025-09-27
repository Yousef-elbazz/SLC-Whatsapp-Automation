require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const { logger, readGroups, readMessage, delay, getRandomDelay } = require('./utils');

class WhatsAppInstantSender {
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
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log('Scan the QR Code below with your phone:');
      console.log(qr);
      logger.info('QR Code generated for instant send authentication');
    });

    this.client.on('ready', async () => {
      console.log('WhatsApp client is ready! Starting instant send...');
      logger.info('WhatsApp client ready for instant send');
      await this.sendToGroups();
      await this.client.destroy();
      process.exit(0);
    });

    this.client.on('authenticated', () => {
      console.log('Authentication successful!');
      logger.info('WhatsApp authentication successful for instant send');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failed:', msg);
      logger.error(`Instant send authentication failed: ${msg}`);
      process.exit(1);
    });
  }

  async sendToGroups() {
    try {
      const groups = readGroups(process.env.GROUPS_PATH || './groups.txt');
      const message = readMessage(process.env.MESSAGE_PATH || './message.txt');

      if (!groups.length) {
        console.error('No groups found in groups.txt');
        logger.error('No groups found for instant send');
        return;
      }

      if (!message.trim()) {
        console.error('No message found in message.txt');
        logger.error('No message found for instant send');
        return;
      }

      logger.info(`Starting instant send to ${groups.length} groups`);
      console.log(`Sending messages instantly to ${groups.length} groups...`);

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
            logger.info(`Instant message sent to group: ${targetGroup.name} (${targetGroup.id._serialized})`);
            console.log(`✓ Sent to: ${targetGroup.name}`);
            
            // Random delay between messages for better security (15-20 seconds)
            const delayMs = getRandomDelay();
            console.log(`Waiting ${delayMs/1000} seconds before next message...`);
            await delay(delayMs);
          } else {
            failedCount++;
            const identifier = groupIdentifier.includes('@g.us') ? 'ID' : 'name';
            logger.warn(`Group not found for instant send by ${identifier}: ${groupIdentifier}`);
            console.log(`✗ Group not found: ${groupIdentifier}`);
          }
        } catch (error) {
          failedCount++;
          logger.error(`Failed instant send to ${groupIdentifier}: ${error.message}`);
          console.log(`✗ Failed to send to ${groupIdentifier}: ${error.message}`);
        }
      }

      logger.info(`Instant send completed. Sent: ${sentCount}, Failed: ${failedCount}`);
      console.log(`\nInstant send completed! Sent: ${sentCount}, Failed: ${failedCount}`);
      console.log('Press any key to close...');

    } catch (error) {
      logger.error(`Error in instant sendToGroups: ${error.message}`);
      console.error('Error sending instant messages:', error.message);
    }
  }

  async start() {
    try {
      await this.client.initialize();
    } catch (error) {
      logger.error(`Failed to initialize instant send client: ${error.message}`);
      console.error('Failed to start WhatsApp instant send:', error.message);
      process.exit(1);
    }
  }
}

// Start instant sending
const instantSender = new WhatsAppInstantSender();
instantSender.start();