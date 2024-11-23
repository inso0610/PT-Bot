module.exports = async ({ interaction, commandObj }) => {
    if (commandObj.smOnly) {
        if (interaction.guild === null) {
            interaction.reply({
                content: 'This command can not be ran in DM\'s.',
                ephemeral: true
            });
            return true;
        } else if (!interaction.member.roles.cache.has('1167782024040435752')) {
            interaction.reply({
                content: 'You do not have access to this command.',
                ephemeral: true
            });
            return true;
        };
    };
};