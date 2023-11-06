const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('eldre-vote')
    .setDescription('Sends a vote')
    .addStringOption((option) => 
        option
            .setName('vote')
            .setDescription('What is the vote?')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('vote-title')
            .setDescription('What is the vote title?')
            .setRequired(true)),


    run: async ({ interaction, client, handler }) => {
        try {
            const vote = interaction.options.getString('vote');
            const voteTitle = interaction.options.getString('vote-title');
            const voteChannel = client.channels.cache.get('1149845361914040412');
            const avatarURL = "https://cdn.discordapp.com/avatars/"+interaction.user.id+"/"+interaction.user.avatar+".jpeg"
            
            const voteEmbed = new EmbedBuilder()
                .setAuthor({
                    name: interaction.user.tag, 
                    iconURL: avatarURL, 
                    //url: 'https://discord.js.org'
                })
                .setTitle(voteTitle)
                .setDescription(vote)

            const voteMessage = await voteChannel.send({
                content: '<@&1150903460565369012>',
                embeds: [voteEmbed]
            });

            voteMessage.react('✅').then(() => voteMessage.react('❌'))

            const thread = await voteMessage.startThread({
                name: voteTitle,
                autoArchiveDuration: 60,
                reason: 'Vote Thread.',
            });            

            interaction.reply({
                content: ('There! Check <#1149845361914040412>'),
                ephemeral: true
            });

        } catch (error) {
            console.log(`Error with vote command! ${error}`)
            interaction.reply({
                content: 'Command failure. Try again.',
                ephemeral: true
            })
        }
    },
    eldreOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: true,
    },
};
