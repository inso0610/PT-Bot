module.exports = (interaction, commandObj) => {
    if (commandObj.devOnly) {
        if (interaction.member.id !== '935889952') {
            interaction.reply ({
                content: 'This command is only for the creator of the bot,',
                ephmeral: true,
            });
            return true;
        }
    }
};