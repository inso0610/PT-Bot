const { EmbedBuilder } = require('discord.js');
const CronJob = require('cron').CronJob;

const applications = require('../../utils/applications.js');

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

    message = await channel.messages.fetch('1397592110848278599').catch( e => {  // Replace with your actual message ID
        console.warn(e);
    });

    if (!message) {
        message = await channel.send({ content: '# Applications' });
        channel.send('<@&1304849124528754729> Had to make a new application message!');
    };

    async function updateMessage() {
        /*const d = new Date();

        let hour = d.getUTCHours().toString();
    
        if (hour.length == 1) {
            const old = hour;
            hour = `0${old}`
        };
    
        let minute = d.getUTCMinutes().toString();
    
        if (minute.length == 1) {
            const old = minute;
            minute = `0${old}`
        };*/

        const operationsApplications = await applications.find({ department: 'Operations' }).exec();

        const operationsEmbed = new EmbedBuilder()
            .setTitle('Operations')
            .addFields(...operationsApplications.map(application => ({
                name: application.role,
                value: `${statusIcons[application.status]} (${application.status})`,
                inline: false
            })))
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

        const brandingApplications = await applications.find({ department: 'Branding' }).exec();
        
        const brandingEmbed = new EmbedBuilder()
            .setTitle('Branding')
            .addFields(...brandingApplications.map(application => ({
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
            .setFooter({ text: 'This message updates every 10 minutes. Last update' })
            .setTimestamp(Date.now())

        message.edit({
            content: '# Applications',
            embeds: [operationsEmbed, communityEmbed, brandingEmbed, developmentEmbed]
        });
    };

    // run every minute
    new CronJob('0 * * * * *', updateMessage, null, true, 'Europe/Oslo', null, false);
};
