module.exports = ({ interaction, commandObj }) => {
    if (commandObj.communityOnly) {
        if (interaction.guild === null) {
            interaction.reply({
                content: 'This command can not be ran in DM\'s.',
                ephemeral: true
            });
            return true;
        } else if (!interaction.member.roles.cache.has('1302284945451913308')) {
            interaction.reply({
                content: 'You do not have access to this command.',
                ephemeral: true
            });

            return true;
        };
    };
};