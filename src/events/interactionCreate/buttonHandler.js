module.exports = async (interaction, client, message) => {
    if(!interaction.isButton()) return;

    if(interaction.customId === "confirm-training") {
        interaction.reply({
            content: 'Ting virka',
            ephemeral: true,
        })
        console.log(interaction.message)
    };
};