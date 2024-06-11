const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    const infoChannel = client.channels.cache.get('1133076724016480516');

    const mainEmbed = new EmbedBuilder()
        .setTitle('General Info')
        .setDescription('# Stuff everyone may need')
        .addFields(
            {name: 'Play the game:', value: 'https://www.roblox.com/games/12894431123/Polar-Tracks-Railway'},
            {name: 'Invite your friends:', value: 'https://discord.gg/kANJmwn3G4'},
            {name: 'Join our Roblox group:', value: 'https://www.roblox.com/groups/15833094/Polar-Tracks'},
            {name: 'Our website:', value: 'https://www.polartracks.no/'}
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

    infoChannel.send({
        embeds: [mainEmbed],
        components: [actionRow],
    });
};