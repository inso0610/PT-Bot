const { EmbedBuilder, time } = require('discord.js');

const applications = require('../../utils/applications.js');
const { data } = require('../../commands/application-stuff/application.js');

const statusIcons = {
    ['Closed']: '<:DangerMain:1177580208585457724>',
    ['Opening soon']: '<a:ExpectProceed:1177580797105025115>',
    ['Opening soon (Not Public)']: '<a:ExpectDivert:1177580734555377674>',
    ['Open']: '<:Proceed:1177580346611601550>',
    ['Open (Not Public)']: '<:DivertMain:1177580426341134397>',
    ['Closing soon']: '<a:ExpectDanger:1177580587419185253> ',
    ['Results out']: '<:DangerMain:1177580208585457724>',
};

module.exports = async (client) => {
    const channel = client.channels.cache.get('1156993148732583957');
    let message;

    message = await channel.messages.fetch('1309887401627484252').catch( e => {  // Replace with your actual message ID
        console.warn(e);
    });

    if (!message) {
        message = await channel.send({ content: '# Applications' });
        channel.send('<@935889950547771512> Had to make a new application message!');
    };

    const d = new Date();

    let hour = d.getUTCHours().toString();

    if (hour.length == 1) {
        const old = hour;
        hour = `0${old}`
    };

    let minute = d.getUTCMinutes().toString();

    if (minute.length == 1) {
        const old = minute;
        minute = `0${old}`
    };

    async function updateMessage() {
        const operationsApplications = await applications.find({ department: 'Operations' }).exec();

        const operationsEmbed = new EmbedBuilder()
            .setTitle('Operations')
            .addFields(...operationsApplications.map(application => ({
                name: application.role,
                value: `${statusIcons[application.status]} (${application.status})`,
                inline: false
            })))
            //.setFooter({ text: `This message updates every minute. Last update: ${hour}:${minute} UTC` });

        const marketingApplications = await applications.find({ department: 'Marketing' }).exec();
        
        const marketingEmbed = new EmbedBuilder()
            .setTitle('Marketing')
            .addFields(...marketingApplications.map(application => ({
                name: application.role,
                value: `${statusIcons[application.status]} (${application.status})`,
                inline: false
            })));
            //.setFooter({ text: `This message updates every minute. Last update: ${hour}:${minute} UTC` });

        const communityApplications = await applications.find({ department: 'Community' }).exec();
        
        const communityEmbed = new EmbedBuilder()
            .setTitle('Community')
            .addFields(...communityApplications.map(application => ({
                name: application.role,
                value: `${statusIcons[application.status]} (${application.status})`,
                inline: false
            })));
            //.setFooter({ text: `This message updates every minute. Last update: ${hour}:${minute} UTC` });

        const developmentApplications = await applications.find({ department: 'Development' }).exec();
        
        const developmentEmbed = new EmbedBuilder()
            .setTitle('Development')
            .addFields(...developmentApplications.map(application => ({
                name: application.role,
                value: `${statusIcons[application.status]} (${application.status})`,
                inline: false
            })))
            .setFooter({ text: `This message updates every minute. Last update: ${hour}:${minute} UTC` });

        message.edit({
            content: '# Applications',
            embeds: [operationsEmbed, marketingEmbed, communityEmbed, developmentEmbed]  // Add the other embeds as well
        });
    };

    updateMessage();
    const messageUpdater = setInterval(updateMessage, 60000);
};
