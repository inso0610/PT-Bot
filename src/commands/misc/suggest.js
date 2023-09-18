const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Sends a suggestion')
    .addStringOption((option) => 
        option
            .setName('suggestion')
            .setDescription('What is the suggestions?')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('suggestion-title')
            .setDescription('What is the suggestion title?')
            .setRequired(true)),


    run: async ({ interaction, client }) => {
        try {
            const suggestion = interaction.options.getString('suggestion');
            const suggestionTitle = interaction.options.getString('suggestion-title');
            const suggestionChannel = client.channels.cache.get('1152944134747865119');
            const avatarURL = "https://cdn.discordapp.com/avatars/"+interaction.user.id+"/"+interaction.user.avatar+".jpeg"
            const acceptedChannel = client.channels.cache.get('1153263811009200168');
            
            const acceptButton = new ButtonBuilder()
                .setCustomId('acceptSuggestion')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success)
                .setDisabled(false);

            const declineButton = new ButtonBuilder()
                .setCustomId('declineSuggestion')
                .setLabel('Decline')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(false);

            const suggestionRow = new ActionRowBuilder()
                .addComponents(acceptButton, declineButton);

            const DisabledAcceptButton = new ButtonBuilder()
                .setCustomId('disabledAcceptSuggestion')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success)
                .setDisabled(true);

            const DisabledDeclineButton = new ButtonBuilder()
                .setCustomId('disabledDeclineSuggestion')
                .setLabel('Decline')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true);

            const DisabledSuggestionRow = new ActionRowBuilder()
                .addComponents(DisabledAcceptButton, DisabledDeclineButton);

            const suggestionEmbed = new EmbedBuilder()
                .setAuthor({
                    name: interaction.user.tag, 
                    iconURL: avatarURL, 
                    //url: 'https://discord.js.org'
                })
                .setTitle(suggestionTitle)
                .setDescription(suggestion)

            const suggestionMessage = await suggestionChannel.send({
                embeds: [suggestionEmbed],
                components: [suggestionRow]
            });

            suggestionMessage.react('👍').then(() => suggestionMessage.react('👎'))

            const thread = await suggestionMessage.startThread({
                name: suggestionTitle,
                autoArchiveDuration: 60,
                reason: 'Suggestion Thread.',
            });            

            interaction.reply({
                content: ('There! Check <#1152944134747865119>'),
                ephemeral: true
            });

            let confirmation = await suggestionMessage.awaitMessageComponent({  });
            
            if (confirmation.customId === 'acceptSuggestion') {
                if (!interaction.member.roles.cache.has('1133749323344125992')) {
                    confirmation.reply({
                        content: 'You do not have access to this button.',
                        ephemeral: true
                    });
                    return true;
                }
                acceptedChannel.send({
                    content: `Suggestion accepted by <@${interaction.user.id}>`,
                    embeds: [suggestionEmbed]
                });

                confirmation.reply('The suggestion was accepted and will now get sent to Directors for approval!')

                suggestionMessage.edit({
                    content: `✅ This suggestion was accepted! It will now get sent to Directors for approval!`,
                    // embeds: [suggestionEmbed],
                    components: [DisabledSuggestionRow]                    
                })

            } else if (confirmation.customId === 'declineSuggestion') {
                if (!interaction.member.roles.cache.has('1133749323344125992')) {
                    confirmation.reply({
                        content: 'You do not have access to this button.',
                        ephemeral: true
                    });
                    return true;
                }

                confirmation.reply('The suggestion was declined.')

                suggestionMessage.edit({
                    content: `❌ This suggestion was declined.`,
                    // embeds: [suggestionEmbed],
                    components: [DisabledSuggestionRow]                    
                })

            }

        } catch (error) {
            console.log(`Error with suggestion command! ${error}`);

            try {
                
                interaction.reply({
                    content: 'Command failure. Try again.',
                    ephemeral: true
                });
            } catch (error2) {
                try {
                    console.log(`Error with suggestion command and could not reply to interaction! ${error2}`);
                    confirmation.reply({
                        content: 'Command failure. Try again.',
                        ephemeral: true
                    });
                } catch (error3) {
                    console.log(`Big failure! ${error3}`)
                }
            }
        }
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};