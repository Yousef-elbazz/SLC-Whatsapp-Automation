require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs-extra');
const path = require('path');
const { logger } = require('./utils');

class GroupExtractor {
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
      logger.info('QR Code generated for group extraction');
    });

    this.client.on('ready', async () => {
      console.log('WhatsApp client is ready! Extracting groups...');
      logger.info('WhatsApp client ready for group extraction');
      await this.extractAllGroups();
      await this.client.destroy();
      process.exit(0);
    });

    this.client.on('authenticated', () => {
      console.log('Authentication successful!');
      logger.info('WhatsApp authentication successful for group extraction');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failed:', msg);
      logger.error(`Group extraction authentication failed: ${msg}`);
      process.exit(1);
    });
  }

  async extractAllGroups() {
    try {
      console.log('Fetching all groups...');
      const chats = await this.client.getChats();
      const groupChats = chats.filter(chat => chat.isGroup);

      if (groupChats.length === 0) {
        console.log('No groups found!');
        logger.warn('No groups found during extraction');
        return;
      }

      console.log(`Found ${groupChats.length} groups!`);
      logger.info(`Found ${groupChats.length} groups for extraction`);

      // Create groups data
      const groupsData = [];
      const groupsForFile = [];

      for (let i = 0; i < groupChats.length; i++) {
        const group = groupChats[i];
        
        // Get group info
        const groupInfo = {
          index: i + 1,
          id: group.id._serialized,
          name: group.name,
          participantCount: group.participants ? group.participants.length : 0,
          isGroup: group.isGroup
        };

        groupsData.push(groupInfo);
        
        // For groups.txt file (ID format)
        groupsForFile.push(group.id._serialized);

        console.log(`${i + 1}. ${group.name} (${groupInfo.participantCount} members)`);
        console.log(`   ID: ${group.id._serialized}`);
        console.log('');
      }

      // Save detailed list with names and IDs
      const detailedList = this.createDetailedList(groupsData);
      await fs.writeFile('extracted-groups-detailed.txt', detailedList, 'utf8');

      // Save simple ID list for groups.txt
      const simpleList = groupsForFile.join('\n');
      await fs.writeFile('extracted-groups-ids.txt', simpleList, 'utf8');

      // Save JSON format for advanced usage
      await fs.writeFile('extracted-groups.json', JSON.stringify(groupsData, null, 2), 'utf8');

      console.log('='.repeat(50));
      console.log('GROUP EXTRACTION COMPLETED!');
      console.log('='.repeat(50));
      console.log(`📊 Total Groups Found: ${groupsData.length}`);
      console.log('');
      console.log('📁 Files Created:');
      console.log('1. extracted-groups-detailed.txt  - Detailed list with names & IDs');
      console.log('2. extracted-groups-ids.txt       - Only IDs (copy to groups.txt)');
      console.log('3. extracted-groups.json          - JSON format for developers');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Open extracted-groups-detailed.txt to see all groups');
      console.log('2. Copy desired IDs from extracted-groups-ids.txt to groups.txt');
      console.log('3. Run the bot normally with start.bat or send-now.bat');
      console.log('');

      logger.info(`Group extraction completed. ${groupsData.length} groups extracted`);

    } catch (error) {
      console.error('Error extracting groups:', error.message);
      logger.error(`Error in group extraction: ${error.message}`);
    }
  }

  createDetailedList(groupsData) {
    let content = `# استخراج مجموعات الواتساب - SLC Automation\n`;
    content += `# تاريخ الاستخراج: ${new Date().toLocaleString('ar-EG')}\n`;
    content += `# إجمالي المجموعات: ${groupsData.length}\n`;
    content += `# ${'='.repeat(60)}\n\n`;

    content += `# كيفية الاستخدام:\n`;
    content += `# 1. انسخ ID المجموعة المطلوبة من الأسفل\n`;
    content += `# 2. الصق في ملف groups.txt\n`;
    content += `# 3. شغل البرنامج عادي\n\n`;

    content += `# ملاحظة: استخدام ID أدق وأسرع من الأسماء\n`;
    content += `# ${'='.repeat(60)}\n\n`;

    groupsData.forEach((group, index) => {
      content += `${index + 1}. اسم المجموعة: ${group.name}\n`;
      content += `   عدد الأعضاء: ${group.participantCount}\n`;
      content += `   ID: ${group.id}\n`;
      content += `   ${'─'.repeat(40)}\n`;
    });

    content += `\n# ${'='.repeat(60)}\n`;
    content += `# قائمة الـ IDs فقط (للنسخ السريع):\n`;
    content += `# ${'='.repeat(60)}\n\n`;

    groupsData.forEach((group) => {
      content += `${group.id}  # ${group.name}\n`;
    });

    return content;
  }

  async start() {
    try {
      await this.client.initialize();
    } catch (error) {
      logger.error(`Failed to initialize group extractor: ${error.message}`);
      console.error('Failed to start group extractor:', error.message);
      process.exit(1);
    }
  }
}

// Start group extraction
const extractor = new GroupExtractor();
extractor.start();