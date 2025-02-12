const { EmbedBuilder, WebhookClient } = require("discord.js");
const countingBlacklist = require('../../utils/countingBlacklist.js');

module.exports = (oldMessage, newMessage) => {
    const webhookClient = new WebhookClient({ id: '1338191419709591682', token: '_bGgIHOt6m5VFFqhahwKNj8b_9M8fkbMueVEfRWz9fY2GEwAMybKYjuKcEsXkEoJ_YJ0' }); 
    
    const ignoredCategories = ['1145464301965037588', '1133750227002736732', '1294325748043092071', 
        '1141398695951208559', '1096576167731023932', '1096576509063471124', '1096575749462425791',
        '1096575490078285967', '1304867108668309604']
    const ignoredChannels = []

    try {
        if (newMessage.author.bot) {
            return;
        } else if (ignoredCategories.includes(newMessage.channel.parent.id)) {
            return;
        } else if (ignoredChannels.includes(newMessage.channel.id)) {
            return;
        } else if (!newMessage.author){
            return;
        } else if (newMessage.webhookId){
            return;
        } else if (newMessage.content === oldMessage.content) {
            return;
        } else {

            const info = new EmbedBuilder()
                .setTitle(`${newMessage.author.username} Edited their message`)
                .addFields(
                    { name: 'Channel:', value: `<#${newMessage.channel.id}>` },
                    { name: 'Message Link:', value: `[Jump!](${newMessage.url})` }
                )
                .setFooter({text: `Author: ${newMessage.author.id} | Message ID: ${newMessage.id}`});
            const oldMessageEmbed = new EmbedBuilder().setTitle('Old message:').setDescription(oldMessage.content);
            const newMessageEmbed = new EmbedBuilder().setTitle('New message:').setDescription(newMessage.content);

            webhookClient.send({
                username: (`${newMessage.author.username} (${newMessage.author.id})`),
                avatarURL: newMessage.author.avatarURL(),
                embeds: [info, oldMessageEmbed, newMessageEmbed]
            }).catch(e => {
                console.warn(`Error in message-logger-update: ${e}`)
                return;
            });
        }
    } catch (error) {
        console.warn(`Error in message-logger-update: ${error}`)
    }
}

//https://discord.com/api/webhooks/1338191419709591682/_bGgIHOt6m5VFFqhahwKNj8b_9M8fkbMueVEfRWz9fY2GEwAMybKYjuKcEsXkEoJ_YJ0