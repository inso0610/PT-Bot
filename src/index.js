require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
//const {  CommandHandler } = require('djs-commander');
const { CommandKit } = require('commandkit');
const path = require('path');

const client = new Client({
    intents:[
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Mongo DB.');

    } catch (error) {
        console.log(`Mongo DB Error: ${error}`);
    }      
})();

new CommandKit({
    client,
    commandsPath: path.join(__dirname, 'commands'),
    eventsPath: path.join(__dirname, 'events'),
    validationsPath: path.join(__dirname, 'validations'),
    devGuildIds: ['1051780690447962122'],
    devUserIds: ['935889950547771512'],
    devRoleIds: ['DEV_ROLE_ID_1', 'DEV_ROLE_ID_2'],
    skipBuiltInValidations: true,
});

client.login(process.env.TOKEN);
