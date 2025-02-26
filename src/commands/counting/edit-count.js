const { SlashCommandBuilder } = require('discord.js');
const counting = require('../../utils/counting.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('edit-count')
    .setDescription('Edit the count')
    .setDMPermission(false)
    .addIntegerOption((option) => 
        option
            .setName('new-count')
            .setDescription('What should the next number be?')
            .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        const countChannel = client.channels.cache.get('1285519874138837002');
        const nextCount = interaction.options.getInteger('new-count')

        await interaction.deferReply({
            ephemeral: true
        });

        try {
            let nextNumber = await counting.findById('66e9500b12c20d26f47cdd88').exec();

            if (!nextNumber) {
                nextNumber = new counting({
                    _id: '66e9500b12c20d26f47cdd88',
                    nextNumber: nextCount,
                    lastNumberSenderId: '0'
                });
            } else {
                nextNumber.nextNumber = nextCount
                nextNumber.lastNumberSenderId = '0'
            }
    
            await nextNumber.save();
    
            countChannel.send({
                content: `The next number has been edited to: ${nextNumber.nextNumber.toString()}`
            });
    
            interaction.editReply({
                content: 'Updated!',
                ephemeral: true
            });
        } catch (error) {
            interaction.editReply({
                content: 'Command failed.',
                ephemeral: true
            });
            console.warn(error);
        }
    },
    gaOnly: true,

    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};