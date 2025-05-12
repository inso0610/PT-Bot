const { MessageFlags } = require('discord.js');

module.exports = ({ interaction, commandObj }) => {
    if (commandObj.trainingReqBlacklist) {
        if (interaction.guild === null) {
            interaction.reply({
                content: 'This command can not be ran in DM\'s.',
                flags: MessageFlags.Ephemeral
            });
            return true;
        } else if (interaction.member.roles.cache.has('1243273175157047418')) {
            interaction.reply({
                content: 'You have been blacklisted from running this command.',
                flags: MessageFlags.Ephemeral
            });
            return true;
        }
    }
};