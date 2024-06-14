const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = async (client) => {
    const infoChannel = client.channels.cache.get('1133076724016480516');
    const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/1251098359561977906/tdr6qJGYUsNfvWLvDrGeY_UU197Z5CBzZN9weGZG3eZYvrwlksd48wa6lJ86pHJ2wjrm' });

    const mainEmbed = new EmbedBuilder()
        .setTitle('General Info')
        .setDescription('# Stuff everyone may need')
        .addFields(
            {name: 'Play the game:', value: 'https://www.roblox.com/games/12894431123/Polar-Tracks-Railway'},
            {name: 'Invite your friends:', value: 'https://discord.gg/kANJmwn3G4'},
            {name: 'Join our Roblox group:', value: 'https://www.roblox.com/groups/15833094/Polar-Tracks'},
            {name: 'Our website:', value: 'https://www.polartracks.no/'}
        );

    const boostEmbed = new EmbedBuilder()
        .setTitle('Booster Perks')
        .setDescription('Booster\'s in the Polar Tracks Discord Server get multiple different perks.')
        .addFields(
            {name: 'Development Insight:', value: 'Booster\'s get more development insights like development streams and more sneak peek\'s.'},
            {name: 'More chat permissions:', value: 'Booster\'s are able to use external emojis and stickers + they get image and embed link perms.'},
            {name: 'Use external apps:', value: 'When Discord releases the feature booster\'s will be able to use external Discord apps.'}
        );

    // Buttons

    const roadMapButton = new ButtonBuilder()
        .setCustomId('roadMapInfo')
		.setLabel('Roadmaps')
		.setStyle(ButtonStyle.Primary);

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
        .addComponents(roadMapButton, socialMediaButton, opManualsButton, contactButton, routesButton);

    // Message

    await infoChannel.send({
        embeds: [mainEmbed],
        components: [actionRow],
    });

    webhookClient.send({
        embeds: [boostEmbed]
    })
};