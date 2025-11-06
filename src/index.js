require('dotenv').config();
const { Client, IntentsBitField, Partials } = require('discord.js');
const mongoose = require('mongoose');
const { CommandKit } = require('commandkit');

const client = new Client({
    intents:[
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.AutoModerationExecution,
        IntentsBitField.Flags.AutoModerationConfiguration
    ],
    partials: [
        Partials.Channel
    ]
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
    eventsPath: `${__dirname}/events`,
    validationsPath: `${__dirname}/validations`,
    //devGuildIds: [''],
    devUserIds: ['935889950547771512', '339379137947107328'],
    //devRoleIds: ['DEV_ROLE_ID_1', 'DEV_ROLE_ID_2'],
    skipBuiltInValidations: false,
    bulkRegister: true,
});

client.login(process.env.TOKEN);
