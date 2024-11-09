module.exports = async ({ interaction, commandObj }) => {
    if (commandObj.ticketModOnly) {
        const guild = interaction.client.guilds.cache.get('1089282844657987587');

        if (!guild) {
            interaction.reply({
                content: 'Could not fetch guild.',
                ephemeral: true
            });
            return true;
        }
        
        const member = await guild.members.fetch(interaction.user.id);

        if (!member) {
            interaction.reply({
                content: 'Could not fetch member.',
                ephemeral: true
            });

            return true;
        }

        if (!member.roles.cache.has('1111370796439453777')) {
            interaction.reply({
                content: 'You do not have access to this command.',
                ephemeral: true
            });

            return true;
        };
    };
};