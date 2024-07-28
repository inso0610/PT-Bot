module.exports = ({ interaction, commandObj }) => {
    if (commandObj.gaOnly) {
        if (interaction.guild === null) {
            interaction.reply({
                content: 'This command can not be ran in DM\'s.',
                ephemeral: true
            });
            return true;
        } else if (!interaction.member.roles.cache.has('1089284396282032178')) {
            interaction.reply({
                content: 'You do not have access to this command.',
                ephemeral: true
            });
            return true;
        }
    }
};