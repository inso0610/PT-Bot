const { EmbedBuilder, ChannelType } = require('discord.js');

const notificationCommands = ['message', 'reset-all-activity', 'add-application']

module.exports = async (interaction, client) => {
    const channel = client.channels.cache.get('1333159918278021190');

    if (interaction.isChatInputCommand()) {
        const isDM = interaction.channel.type === ChannelType.DM;

        // Retrieve options and format them into a readable string
        const options = interaction.options.data
            .map(option => `${option.name}: ${option.value}`)
            .join('\n') || 'No options provided';

        const embed = new EmbedBuilder()
            .setTitle('Command executed')
            .addFields(
                { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})` },
                { name: 'Command', value: interaction.commandName },
                { name: 'Options', value: options },
                { name: 'Channel', value: `${isDM ? 'Direct Message' : `${interaction.channel.name} (${interaction.channel.id})`}` },
            )
            .setTimestamp(Date.now());

        if (notificationCommands.includes(interaction.commandName)) {
            channel.send({
                content: '<@935889950547771512> <@312986921804759051>',
                embeds: [embed]
            });
        } else {
            channel.send({
                embeds: [embed]
            });
        }
    } else if (interaction.isButton()) {
        const isDM = interaction.channel.type === ChannelType.DM;

        const embed = new EmbedBuilder()
            .setTitle('Button executed')
            .addFields(
                { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})` },
                { name: 'Button ID', value: interaction.customId },
                { name: 'Channel', value: `${isDM ? 'Direct Message' : `${interaction.channel.name} (${interaction.channel.id})`}` },
            )
            .setTimestamp(Date.now());

        channel.send({
            embeds: [embed]
        });
    };
};
