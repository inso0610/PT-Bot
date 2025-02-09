const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = async (client) => {
    const infoChannel = client.channels.cache.get('1133076724016480516');
    const pingRoleChannel = client.channels.cache.get('1136706480645603388');
    const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/1251098359561977906/tdr6qJGYUsNfvWLvDrGeY_UU197Z5CBzZN9weGZG3eZYvrwlksd48wa6lJ86pHJ2wjrm' });

    const mainEmbed = new EmbedBuilder()
        .setTitle('General Info')
        .setDescription('# Stuff everyone may need')
        .addFields(
            {name: 'Play the game:', value: 'https://www.roblox.com/games/12894431123/Polar-Tracks-Railway'},
            {name: 'Invite your friends:', value: 'https://discord.gg/kANJmwn3G4'},
            {name: 'Join our Roblox group:', value: 'https://www.roblox.com/groups/15833094/Polar-Tracks'},
            {name: 'Our website:', value: 'https://www.polartracks.no/'},
            {name: 'Unable to use one of our services?', value: 'Please check our status page: https://status.polartracks.no/'}
        );

    const boostEmbed = new EmbedBuilder()
        .setColor(0xf47fff)
        .setTitle('Booster Perks')
        .setDescription('Booster\'s in the Polar Tracks Discord Server get multiple different perks.')
        .addFields(
            {name: 'Development Insight:', value: 'Booster\'s get more development insights like development streams and more sneak peek\'s.'},
            {name: 'More chat permissions:', value: 'Booster\'s are able to use external emojis and stickers + they get image and embed link perms.'},
            {name: 'Use external apps:', value: 'When Discord releases the feature booster\'s will be able to use external Discord apps.'}
        );

    // Buttons

    /*const roadMapButton = new ButtonBuilder()
        .setCustomId('roadMapInfo')
		.setLabel('Roadmaps')
		.setStyle(ButtonStyle.Primary);*/

    /*const roadMapButton = new ButtonBuilder()
        .setURL('https://sharing.clickup.com/9012433031/b/6-901205295987-2/board')
        .setLabel('Development roadmap')
        .setStyle(ButtonStyle.Link);*/

    const socialMediaButton = new ButtonBuilder()
        .setCustomId('socialMediaInfo')
        .setLabel('Social Media Accounts')
        .setStyle(ButtonStyle.Primary);
    
    const opManualsButton = new ButtonBuilder()
        .setURL('https://guides.polartracks.no/start')
        .setLabel('Operations Manuals')
        .setStyle(ButtonStyle.Link);

    const contactButton = new ButtonBuilder()
        .setURL('https://polartracks.no/contact')
        .setLabel('Contact Info')
        .setStyle(ButtonStyle.Link);

    const routesButton = new ButtonBuilder()
        .setCustomId('routesInfo')
        .setLabel('Train Routes')
        .setStyle(ButtonStyle.Primary);


    // Action Row

    const actionRow = new ActionRowBuilder()
        .addComponents(socialMediaButton, opManualsButton, contactButton, routesButton);

    // Message

    /*await infoChannel.send({
        embeds: [mainEmbed],
        components: [actionRow],
    });

    webhookClient.send({
        embeds: [boostEmbed]
    })*/

    const createTicketButton = new ButtonBuilder()
        .setCustomId('createTicket')
        .setLabel('Create a ticket')
        .setStyle(ButtonStyle.Success);

    const ticketRow = new ActionRowBuilder()
        .addComponents(createTicketButton);

    /*await infoChannel.send({
        content: '# Use this button to create a ticket if you need help with something.',
        components: [ticketRow]
    });*/

    // Ping roles
    const pingRoleEmbed = new EmbedBuilder()
        .setTitle('Ping Roles')
        .addFields(
            {name: '👷‍♂️', value: 'Get pinged for development updates'},
            {name: '🧑‍🎓', value: 'Get pinged for information regarding trainings'},
            {name: '🚄', value: 'Get pinged for upcoming shifts'},
            {name: 'ℹ️', value: 'Get pinged for <#1142210439065911386>'},
            {name: '🎉', value: 'Get pinged for events'},
            {name: '<:PolarTracks:1135893701403623594>', value: 'Get pinged for engagement announcements'},
            {name: '🪦', value: 'Get pinged when <#1101035696334057483> has low activity and someone requests this ping.'}
        )
    
    const devPingButton = new ButtonBuilder()
        .setCustomId('reactionRole-1136706327993909350')
        .setLabel('Dev Ping')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👷‍♂️');
    
    const trainingPingButton = new ButtonBuilder()
        .setCustomId('reactionRole-1140220447535923200')
        .setLabel('Training Ping')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🧑‍🎓');
    
    const shiftPingButton = new ButtonBuilder()
        .setCustomId('reactionRole-1140248514568405044')
        .setLabel('Shift Ping')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🚄');

    const rfotdPingButton = new ButtonBuilder()
        .setCustomId('reactionRole-1142391663910735883')
        .setLabel('RFOTD Ping')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('ℹ️');
    
    const eventPingButton = new ButtonBuilder()
        .setCustomId('reactionRole-1149802530507862056')
        .setLabel('Event Ping')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎉');

    const engagementPingButton = new ButtonBuilder()
        .setCustomId('reactionRole-1172284324868014080')
        .setLabel('Engagement Ping')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('<:PolarTracks:1135893701403623594>');

    const deadChatPingButton = new ButtonBuilder()
        .setCustomId('reactionRole-1308429122975957132')
        .setLabel('Dead chat revive ping')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🪦');

    const pingRoleRow1 = new ActionRowBuilder()
        .addComponents(devPingButton, trainingPingButton, shiftPingButton, rfotdPingButton, eventPingButton);

    const pingRoleRow2 = new ActionRowBuilder()
        .addComponents(engagementPingButton, deadChatPingButton);
    
    /*await pingRoleChannel.send({
        embeds: [pingRoleEmbed],
        components: [pingRoleRow1, pingRoleRow2]
    });*/
};