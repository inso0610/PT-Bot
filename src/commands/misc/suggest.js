const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Sends a suggestion')
    .addStringOption((option) => 
        option
            .setName('suggestion-title')
            .setDescription('What is the suggestion title?')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('suggestion')
            .setDescription('What is the suggestions?')
            .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        try {
            const suggestion = interaction.options.getString('suggestion');
            let suggestionTitle = interaction.options.getString('suggestion-title');
            const suggestionChannel = client.channels.cache.get('1152944134747865119');
            //const avatarURL = "https://cdn.discordapp.com/avatars/"+interaction.user.id+"/"+interaction.user.avatar+".jpeg";
            const avatarURL = interaction.user.displayAvatarURL();

            const acceptButton = new ButtonBuilder()
                .setCustomId('acceptSuggestion')
                .setLabel('Accept-Development')
                .setStyle(ButtonStyle.Success)
                .setDisabled(false);

            const declineButton = new ButtonBuilder()
                .setCustomId('declineSuggestion')
                .setLabel('Decline')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(false);

            const acceptButtonEm = new ButtonBuilder()
                .setCustomId('acceptSuggestion-EM')
                .setLabel('Accept-Community')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false);

            const row = new ActionRowBuilder()
                .addComponents(acceptButton, declineButton, acceptButtonEm);
            
            const suggestionEmbed = new EmbedBuilder()
                .setAuthor({
                    name: interaction.user.tag, 
                    iconURL: avatarURL, 
                    //url: 'https://discord.js.org'
                })
                .setTitle(suggestionTitle)
                .setDescription(suggestion)
                .setFooter({
                    text: interaction.user.id
                });

            const suggestionMessage = await suggestionChannel.send({
                embeds: [suggestionEmbed],
                components: [row],
            });

            suggestionMessage.react('👍').then(() => suggestionMessage.react('👎'));

            if (suggestionTitle.length >= 60 ) {
                suggestionTitle = 'Suggestion name too long to be used in thread'
            };

            /*const thread = await */suggestionMessage.startThread({
                name: suggestionTitle,
                autoArchiveDuration: 60,
                reason: 'Suggestion Thread.',
            });            

            interaction.reply({
                content: ('There! Check <#1152944134747865119>'),
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.warn(`Error with suggestion command! ${error}`)
            interaction.reply({
                content: 'Command failure. Try again.',
                flags: MessageFlags.Ephemeral
            });
        };
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};