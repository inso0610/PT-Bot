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
            
            let acceptButton = new ButtonBuilder()
                .setCustomId('acceptSuggestion')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success)
                .setDisabled(false);

            let declineButton = new ButtonBuilder()
                .setCustomId('declineSuggestion')
                .setLabel('Decline')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(false);

            let suggestionRow = new ActionRowBuilder()
                .addComponents(acceptButton, declineButton);

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

        } catch (error) {
            console.log(`Error with suggestion command! ${error}`)
            interaction.reply({
                content: 'Command failure. Try again.',
                ephemeral: true
            })
        }
    }
}