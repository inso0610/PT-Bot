const { EmbedBuilder, ChannelType } = require('discord.js');

const notificationCommands = ['message', 'reset-all-activity', 'add-application'];

module.exports = async (interaction, client) => {
    const channel = client.channels.cache.get('1333159918278021190');

    if (interaction.isChatInputCommand()) {
        const isDM = interaction.channel.type === ChannelType.DM;
        const command = interaction.commandName;
        let subcommand = null;
        let options = 'No options provided';

        const truncate = (text, length = 1000) => text.length > length ? text.substring(0, length - 3) + '...' : text;

        if (interaction.options.getSubcommand(false)) {
            subcommand = interaction.options.getSubcommand();
            options = interaction.options.data
                .find(option => option.name === subcommand)?.options
                ?.map(option => `${option.name}: ${truncate(String(option.value), 1000)}`)
                .join('\n') || 'No options provided';
        } else {
            options = interaction.options.data
                .map(option => `${option.name}: ${truncate(String(option.value), 1000)}`)
                .join('\n') || 'No options provided';
        }

        const embed = new EmbedBuilder()
            .setTitle('Command executed')
            .addFields(
                { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})` },
                { name: 'Command', value: subcommand ? `${command} ${subcommand}` : command },
                { name: 'Options', value: options },
                { name: 'Channel', value: `${isDM ? 'Direct Message' : `${interaction.channel.name} (${interaction.channel.id})`}` },
            )
            .setTimestamp(Date.now());

        if (notificationCommands.includes(command)) {
            channel.send({
                content: '<@312986921804759051>',
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
