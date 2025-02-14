require('dotenv').config();
const { EmbedBuilder, WebhookClient } = require("discord.js");

module.exports = async (message) => {
    const webhookClient = new WebhookClient({ id: '1338191419709591682', token: '_bGgIHOt6m5VFFqhahwKNj8b_9M8fkbMueVEfRWz9fY2GEwAMybKYjuKcEsXkEoJ_YJ0' }); 
    
    const ignoredCategories = ['1145464301965037588', '1133750227002736732', '1294325748043092071', 
        '1141398695951208559', '1096576167731023932', '1096576509063471124', '1096575749462425791',
        '1096575490078285967', '1304867108668309604']
    const ignoredChannels = []

    try {
        if (message.author.bot) {
            return;
        } else if (ignoredCategories.includes(message.channel.parent.id)) {
            return;
        } else if (ignoredChannels.includes(message.channel.id)) {
            return;
        } else if (message.webhookId){
            return;
        } else if (!message.author){
            return;
        } else if (!message.guild) {
            return;
        } else {

            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: 'MESSAGE_DELETE',
            });

            const deletionLog = fetchedLogs.entries.first();

            if (deletionLog.target.id === client.user.id) {
                return;
            };

            const attatchments = message.attachments.map(attachment => {
                return attachment.url;
            });

            const deletedMessage = new EmbedBuilder()
            .setTitle(`Deleted message from: ${message.author.username}`)
            .setDescription(message.content)
            .addFields(
                { name: 'Channel:', value: `<#${message.channel.id}>` }
            )
            .setFooter({text: `Author: ${message.author.id} | Message ID: ${message.id}`});

            webhookClient.send({
                username: (`${message.author.username} (${message.author.id})`),
                avatarURL: message.author.avatarURL(),
                embeds: [ deletedMessage ],
                files: attatchments
            }).catch(e => {
                console.warn(`Error in message-logger-delete: ${e}`)
                return;
            });
        }
    } catch (error) {
        console.warn(`Error in message-logger-delete: ${error}`)
    }
}

//https://discord.com/api/webhooks/1338191419709591682/_bGgIHOt6m5VFFqhahwKNj8b_9M8fkbMueVEfRWz9fY2GEwAMybKYjuKcEsXkEoJ_YJ0