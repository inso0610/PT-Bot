const { SlashCommandBuilder, MessageFlags } = require('discord.js')
const activity = require('../../utils/activity.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('edit-activity')
    .setDescription('Edit\'s the activity of a manager')
    .setDMPermission(false)
    .addStringOption((option) => 
        option
            .setName('type')
            .setDescription('What type of activity are you editing?')
            .setRequired(true)
            .addChoices(
				{ name: 'Shift', value: 'shifts' },
				{ name: 'Training', value: 'trainings' },
				{ name: 'Event', value: 'events' }
			))
    .addStringOption((option) => 
        option
            .setName('operator')
            .setDescription('What do you want to do with the managers activity?')
            .setRequired(true)
            .addChoices(
				{ name: 'Add', value: 'add' },
				{ name: 'Remove', value: 'remove' },
				{ name: 'Reset', value: 'reset' },
			))
    .addUserOption((option) => 
        option
            .setName('manager')
            .setDescription('Who are you editing the activity of?')
            .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        const type =  interaction.options.getString('type');
        const manager = interaction.options.getUser('manager');
        const operator = interaction.options.getString('operator');

        const managerActivity = await activity.findOne( {discordId: manager.id} ).exec()

        if (managerActivity) {
            if (operator === 'add') {
                managerActivity[type] += 1;
            } else if (operator === 'remove') {
                managerActivity[type] -= 1;
            } else if (operator === 'reset') {
                managerActivity[type] = 0;
            };

            await managerActivity.save();

            interaction.reply({
                content: 'Successfully registered',
                flags: MessageFlags.Ephemeral
            });
        } else {
            interaction.reply({
                content: 'This user is not in the activity system',
                flags: MessageFlags.Ephemeral
            });
        };
    },
    smOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
}