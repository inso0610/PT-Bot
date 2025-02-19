const { EmbedBuilder, WebhookClient } = require("discord.js");
const webhookClient = new WebhookClient({ id: '1338191419709591682', token: '_bGgIHOt6m5VFFqhahwKNj8b_9M8fkbMueVEfRWz9fY2GEwAMybKYjuKcEsXkEoJ_YJ0' }); 

module.exports = async (message) => {
    const ignoredCategories = ['1145464301965037588', '1133750227002736732', '1294325748043092071', 
        '1141398695951208559', '1096576167731023932', '1096576509063471124', '1096575749462425791',
        '1096575490078285967', '1304867108668309604'];
    const ignoredChannels = [];

    try {
        if (
            message.author?.bot || 
            ignoredCategories.includes(message.channel?.parent?.id) ||
            ignoredChannels.includes(message.channel?.id) || 
            message.webhookId || 
            !message.author || 
            !message.guild
        ) {
            return;
        }

        const fetchedLogs = await message.guild.fetchAuditLogs({
            limit: 1,
            type: 72, // MESSAGE_DELETE action type
        });

        const deletionLog = fetchedLogs.entries.first();

        if (deletionLog?.target?.id === message.client.user.id) {
            return;
        }

        const attachments = message.attachments.map(attachment => attachment.url);

        const deletedMessage = new EmbedBuilder()
            .setTitle(`Deleted message from: ${message.author.username}`)
            .setDescription(message.content || "*No content*")
            .addFields({ name: 'Channel:', value: `<#${message.channel.id}>` })
            .setFooter({ text: `Author: ${message.author.id} | Message ID: ${message.id}` });

        await webhookClient.send({
            username: `${message.author.username} (${message.author.id})`,
            avatarURL: message.author.avatarURL(),
            embeds: [deletedMessage],
            files: attachments
        }).catch(e => console.warn(`Error in message-logger-delete: ${e}`));

    } catch (error) {
        console.warn(`Error in message-logger-delete: ${error}`);
    }
};
