const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const activity = require('../../utils/activity.js');

function getRobloxId(id) {
    const functionResult = fetch(`https://registry.rover.link/api/guilds/1089282844657987587/discord-to-roblox/${id.toString()}`, { method: "GET", headers: { "Authorization": "Bearer rvr2g089xijilnr8qr2tmpnud2v8k379vo089k2qbxwzyh0t252y9h4arqf1d2qkbhz2" } })
	    .then((response) => response.json())
	    .then((data) => {
            try {
                const responseData = JSON.parse(JSON.stringify(data));

                const robloxID = responseData.robloxID.toString();

                return robloxID;
            } catch (error) {
                console.warn(error)
                return [error];
            };
        });
    return functionResult;
};

module.exports = {
    data: new SlashCommandBuilder()
    .setName('manage-activity')
    .setDescription('Manage a managers activity')
    .setContexts(['Guild'])
    .addStringOption((option) => 
        option
            .setName('function')
            .setDescription('What do you want to do with this managers activity?')
            .setRequired(true)
            .addChoices(
				{ name: 'Create', value: 'create' },
				{ name: 'Delete', value: 'delete' },
				{ name: 'Reset', value: 'reset' },
                { name: 'Get', value: 'get' } 
			))
    .addUserOption((option) => 
        option
            .setName('manager')
            .setDescription('Who are you adding activity to?')
            .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const activityFunction =  interaction.options.getString('function');
        const manager = interaction.options.getUser('manager');

        if (activityFunction === 'create') {
            if (await activity.findOne( {discordId: manager.id} )) {
                interaction.editReply({
                    content: 'This manager already exists in the system.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            };
            
            const robloxId = await getRobloxId(manager.id);
            if (Array.isArray(robloxId)) {
                console.log(robloxId[0])
                interaction.editReply({
                    content: 'The command failed. Contact Emilsen.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            };

            const managerActivity = new activity({
                discordId: manager.id,
                robloxId: robloxId
            });

            managerActivity.save();

            interaction.editReply({
                content: 'Created successfully.',
                flags: MessageFlags.Ephemeral
            });
            
        } else if (activityFunction === 'delete' ) {
            await activity.findOneAndDelete( {discordId: manager.id} );

            interaction.editReply({
                content: 'Deleted successfully.',
                flags: MessageFlags.Ephemeral
            });
        } else if (activityFunction === 'reset' ) {
            const managerActivity = await activity.findOne( {discordId: manager.id} ).exec();

            if (managerActivity) {
                const oldActivityEmbed = new EmbedBuilder()
                .setTitle('Old Activity')
                .addFields(
                    { name: 'Shifts:', value: managerActivity.shifts.toString() },
                    { name: 'Trainings:', value: managerActivity.trainings.toString() },
                    { name: 'Events:', value: managerActivity.events.toString() }
                );

                managerActivity.shifts = 0;
                managerActivity.trainings = 0;
                managerActivity.events = 0;

                managerActivity.save();

                interaction.editReply({
                    content: 'Reset successfully.',
                    embeds: [oldActivityEmbed],
                    flags: MessageFlags.Ephemeral
                });
            } else {
                interaction.editReply({
                    content: 'This user is not in the activity system',
                    flags: MessageFlags.Ephemeral
                });
            };
        } else if (activityFunction === 'get' ) {
            const managerActivity = await activity.findOne( {discordId: manager.id} ).exec();

            if (managerActivity) {
                const activityEmbed = new EmbedBuilder()
                    .setTitle('Activity')
                    .addFields(
                        { name: 'Shifts:', value: managerActivity.shifts.toString() },
                        { name: 'Trainings:', value: managerActivity.trainings.toString() },
                        { name: 'Events:', value: managerActivity.events.toString() }
                    );  

                interaction.editReply({
                    content: 'Got activity.',
                    embeds: [activityEmbed],
                    flags: MessageFlags.Ephemeral
                });
            } else {
                interaction.editReply({
                    content: 'This user is not in the activity system',
                    flags: MessageFlags.Ephemeral
                });
            };
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