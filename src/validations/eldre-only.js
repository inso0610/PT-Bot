module.exports = ({ interaction, commandObj }) => {
    if (commandObj.eldreOnly) {
        if (!interaction.member.roles.cache.has('1150903460565369012')) {
            interaction.reply({
                content: 'You do not have access to this command.',
                ephemeral: true
            });
            return true;
        }
    }
};