const { MessageFlags } = require('discord.js');

module.exports = async ({ interaction, commandObj }) => {
    if (commandObj.ticketModOnly) {
        const guild = interaction.client.guilds.cache.get('1089282844657987587');

        if (!guild) {
            interaction.reply({
                content: 'Could not fetch guild.',
                flags: MessageFlags.Ephemeral
            });
            return true;
        };
        
        const member = await guild.members.fetch(interaction.user.id);

        if (!member) {
            interaction.reply({
                content: 'Could not fetch member.',
                flags: MessageFlags.Ephemeral
            });

            return true;
        }

        if (!member.roles.cache.has('1111370796439453777') && !member.roles.cache.has('1142479698635526304') && !member.roles.cache.has('1140260309915938866')) {
            interaction.reply({
                content: 'You do not have access to this command.',
                flags: MessageFlags.Ephemeral
            });

            return true;
        };
    };
};