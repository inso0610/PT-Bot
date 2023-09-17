module.exports = (interaction, commandObj) => {
    if (commandObj.opTeamOnly) {
        if (!interaction.member.roles.cache.has('1133749323344125992')) {
            interaction.reply({
                content: 'You do not have access to this command.',
                ephemeral: true
            });
            return true;
        }
    }
};