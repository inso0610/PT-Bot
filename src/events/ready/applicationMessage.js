const { EmbedBuilder } = require('discord.js');

const applications = require('../../utils/applications.js');

const statusIcons = {
    ['Closed']: '<:DangerMain:1177580208585457724>',
    ['Opening soon']: '<:ExpectProceed:1177580797105025115>',
    ['Opening soon (Not Public)']: '<:ExpectDivert:1177580734555377674>',
    ['Open']: '<:Proceed:1177580346611601550>',
    ['Open (Not Public)']: '<:DivertMain:1177580426341134397>',
    ['Closing soon']: '<:ExpectDanger:1177580587419185253> ',
    ['Results out']: '<:DangerMain:1177580208585457724>',
};

module.exports = async (client) => {
    const channel = client.channels.cache.get('1308424908665126982');
    let message;

    message = await channel.messages.fetch('1309659122471407676').catch(async () => {  // Replace with your actual message ID
        message = await channel.send({ content: '# Applications' });
        channel.send('<@935889950547771512> Had to make a new application message!');
    });

    async function updateMessage() {
        const operationsApplications = await applications.find({ department: 'Operations' }).exec();

        const operationsEmbed = new EmbedBuilder()
            .setTitle('Operations')
            .addFields(...operationsApplications.map(application => ({
                name: application.role,
                value: `${statusIcons[application.status]} (${application.status})`,
                inline: false
            })));

        const marketingApplications = await applications.find({ department: 'Marketing' }).exec();
        
        const marketingEmbed = new EmbedBuilder()
            .setTitle('Marketing')
            .addFields(...marketingApplications.map(application => ({
                name: application.role,
                value: `${statusIcons[application.status]} (${application.status})`,
                inline: false
            })));

        const communityApplications = await applications.find({ department: 'Community' }).exec();
        
        const communityEmbed = new EmbedBuilder()
            .setTitle('Community')
            .addFields(...communityApplications.map(application => ({
                name: application.role,
                value: `${statusIcons[application.status]} (${application.status})`,
                inline: false
            })));

        const developmentApplications = await applications.find({ department: 'Development' }).exec();
        
        const developmentEmbed = new EmbedBuilder()
            .setTitle('Development')
            .addFields(...developmentApplications.map(application => ({
                name: application.role,
                value: `${statusIcons[application.status]} (${application.status})`,
                inline: false
            })));

        message.edit({
            embeds: [operationsEmbed, marketingEmbed, communityEmbed, developmentEmbed]  // Add the other embeds as well
        });
    }

    updateMessage();
    setInterval(updateMessage, 60000);
};
