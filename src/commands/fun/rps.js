const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play rock paper scissors against the bot')
    .addStringOption((option) => 
        option
            .setName('selection')
            .setDescription('Do you want to play rock, paper or scissors?')
            .setRequired(true)
            .addChoices(
                { name: 'Rock', value: 'Rock' },
                { name: 'Paper', value: 'Paper' },
                { name: 'Scissors', value: 'Scissors' }
            )),

    run: ({ interaction, client, handler }) => {
        const selection = interaction.options.getString('selection');
        const botSelection = Math.floor((Math.random() * 3) + 1); 
        // const botSelection = 3;   
        let gameEmbed
        
        try {
            if (selection === 'Rock' && botSelection === 1) {
                gameEmbed = new EmbedBuilder()
                .setTitle(`Rock Paper Scissors: ${interaction.user.tag} vs PT Bot`)
                .setDescription(`Your selection: ${selection}
                Bot's selection: Rock
                Result: Tie`);
    
                interaction.reply({
                    embeds: [gameEmbed]
                });
            } else if (selection === 'Rock' && botSelection === 2) {
                gameEmbed = new EmbedBuilder()
                .setTitle(`Rock Paper Scissors: ${interaction.user.tag} vs PT Bot`)
                .setDescription(`Your selection: ${selection}
                Bot's selection: Paper
                Result: Bot won`);
    
                interaction.reply({
                    embeds: [gameEmbed]
                });
            } else if (selection === 'Rock' && botSelection === 3) {
                gameEmbed = new EmbedBuilder()
                .setTitle(`Rock Paper Scissors: ${interaction.user.tag} vs PT Bot`)
                .setDescription(`Your selection: ${selection}
                Bot's selection: Scissors
                Result: You won`);
    
                interaction.reply({
                    embeds: [gameEmbed]
                });
            } else if (selection === 'Paper' && botSelection === 1) {
                gameEmbed = new EmbedBuilder()
                .setTitle(`Rock Paper Scissors: ${interaction.user.tag} vs PT Bot`)
                .setDescription(`Your selection: ${selection}
                Bot's selection: Rock
                Result: You won`);
    
                interaction.reply({
                    embeds: [gameEmbed]
                });
            } else if (selection === 'Paper' && botSelection === 2) {
                gameEmbed = new EmbedBuilder()
                .setTitle(`Rock Paper Scissors: ${interaction.user.tag} vs PT Bot`)
                .setDescription(`Your selection: ${selection}
                Bot's selection: Paper
                Result: Tie`);
    
                interaction.reply({
                    embeds: [gameEmbed]
                });
            } else if (selection === 'Paper' && botSelection === 3) {
                gameEmbed = new EmbedBuilder()
                .setTitle(`Rock Paper Scissors: ${interaction.user.tag} vs PT Bot`)
                .setDescription(`Your selection: ${selection}
                Bot's selection: Scissors
                Result: Bot won`);
    
                interaction.reply({
                    embeds: [gameEmbed]
                });
            } else if (selection === 'Scissors' && botSelection === 1) {
                gameEmbed = new EmbedBuilder()
                .setTitle(`Rock Paper Scissors: ${interaction.user.tag} vs PT Bot`)
                .setDescription(`Your selection: ${selection}
                Bot's selection: Rock
                Result: Bot won`);
    
                interaction.reply({
                    embeds: [gameEmbed]
                });
            } else if (selection === 'Scissors' && botSelection === 2) {
                gameEmbed = new EmbedBuilder()
                .setTitle(`Rock Paper Scissors: ${interaction.user.tag} vs PT Bot`)
                .setDescription(`Your selection: ${selection}
                Bot's selection: Paper
                Result: You won`);
    
                interaction.reply({
                    embeds: [gameEmbed]
                });
            } else if (selection === 'Scissors' && botSelection === 3) {
                gameEmbed = new EmbedBuilder()
                .setTitle(`Rock Paper Scissors: ${interaction.user.tag} vs PT Bot`)
                .setDescription(`Your selection: ${selection}
                Bot's selection: Scissors
                Result: Tie`);
    
                interaction.reply({
                    embeds: [gameEmbed]
                });
            };
        } catch (error) {
            interaction.reply({
                content: 'Error, contact <@935889950547771512>',
                ephemeral: true
            });

            console.warn(error)
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
