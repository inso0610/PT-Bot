require('dotenv').config();
const { Client, IntentsBitField, ActivityType } = require('discord.js');
const {  CommandHandler } = require('djs-commander');
const path = require('path');

const client = new Client({
    intents:[
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
    
});

new CommandHandler({
    client,
    commandsPath: path.join(__dirname, 'commands'),
    validationsPath: path.join(__dirname, 'validations'),
    // testServer: '1051780690447962122',
    eventsPath: path.join(__dirname, 'events')
});

client.login(process.env.TOKEN);
