const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const activity = require('../../utils/activity.js');
const activityRequirements = require('../../utils/activityRequirement.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Get your activity')
    .setDMPermission(false),

    run: async ({ interaction, client, handler }) => {
        
    },
    modOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: true,
    },
}