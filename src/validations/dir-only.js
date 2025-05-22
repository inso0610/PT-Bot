const { MessageFlags } = require('discord.js');

module.exports = ({ interaction, commandObj }) => {
    if (commandObj.dirOnly) {
        if (interaction.guild === null) {
            interaction.reply({
                content: 'This command can not be ran in DM\'s.',
                flags: MessageFlags.Ephemeral
            });
            return true;
        } else if (!interaction.member.roles.cache.has('1140260309915938866')) {
            interaction.reply({
                content: 'You do not have access to this command.',
                flags: MessageFlags.Ephemeral
            });
            return true;
        }
    }
};