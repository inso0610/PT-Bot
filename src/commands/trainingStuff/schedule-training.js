const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const model = require('../../utils/trainings.js')

function getRobloxId(id) {
    const functionResult = fetch(`https://api.blox.link/v4/public/guilds/1089282844657987587/discord-to-roblox/${id.toString()}`, { method: "GET", headers: { "Authorization": "66ef19b6-b0f6-41f4-b883-63d833484ac6" } })
	    .then((response) => response.json())
	    .then((data) => {
            try {
                const response = JSON.parse(JSON.stringify(data));

                const robloxID = response.robloxID.toString();
                const username = response.resolved.roblox.name.toString();

                const userInfo = [robloxID, username]
                return userInfo
            } catch (error) {
                console.log(error)
                return error
            }
        });
    return functionResult
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('schedule-training')
    .setDescription('Scheduled a training')
    .addStringOption((option) => 
        option
            .setName('type')
            .setDescription('What type of training are you hosting?')
            .setRequired(true)
            .addChoices(
				{ name: 'Driver', value: 'Driver' },
				{ name: 'Conductor', value: 'Conductor' },
				{ name: 'Dispatcher', value: 'Dispatcher' },
                { name: 'Signaller', value: 'Signaller' }
			))

    .addStringOption((option) => 
        option
            .setName('date')
            .setDescription('Format: dd/mm/yyyy. Use UTC time!')
            .setRequired(true))

    .addStringOption((option) => 
        option
            .setName('time')
            .setDescription('Format: hh:mm. Use UTC time!')
            .setRequired(true))

    .addStringOption((option) => 
        option
            .setName('additional-info')
            .setDescription('Write any additional info about the training here.')
            .setRequired(false))
            
    .addUserOption((option) => 
        option
            .setName('host')
            .setDescription('Who is hosting the training?')
            .setRequired(false)),

    run: async ({ interaction, client, handler }) => {
        try {
            const hostCMD = interaction.options.getUser('host') ?? interaction.user;
            const id = hostCMD.id
            const trainingTypeCMD = interaction.options.getString('type');
            const scheduledDateCMD = interaction.options.getString('date');
            const scheduledStartCMD = interaction.options.getString('time');
            const additionalInfoCMD = interaction.options.getString('additional-info') ?? 'No additional information.';

            const trainingChannel = client.channels.cache.get('1218883814491820134');
            
            const userInfo = await getRobloxId(id);
            if (!Array.isArray(userInfo)) {
                console.log(userInfo)
                interaction.reply({
                    content: 'The command failed. Contact Emilsen.',
                    ephemeral: true
                })
                return
            };
            const rblxId = userInfo[0];
            const rblxName = userInfo[1];

            const splitDate = scheduledDateCMD.split('/')
            const splitTime = scheduledStartCMD.split(':')

            const dateCMD = new Date(Date.UTC(splitDate[2], splitDate[1]-1, splitDate[0], splitTime[0], splitTime[1]));

            const timestampMilli = dateCMD.getTime();
            const timestampCMD = Math.floor(timestampMilli / 1000);
    
            const newTraining = new model({
                hostDiscordId: id,
                hostRobloxId: rblxId,
                hostRobloxUsername: rblxName,
                trainingType: trainingTypeCMD,
                date: dateCMD,
                timestamp: timestampCMD.toString(),
                additionalInfo: additionalInfoCMD
            });
    
            await newTraining.save();

            const trainingId = newTraining._id.toString();

            const trainingEmbed = new EmbedBuilder()
                .setTitle('You have been assigned to a training!')
                .setDescription(`**When making changes use this id: ${trainingId}.**`)
                .addFields(
                    { name: 'Host Discord ID:', value: id },
                    { name: 'Host Roblox ID:', value: rblxId },
                    { name: 'Host Roblox Username:', value: rblxName },
                    { name: 'Training Type:', value: trainingTypeCMD },
                    { name: 'Scheduled Date in UTC:', value: scheduledDateCMD },
                    { name: 'Scheduled Start in UTC:', value: scheduledStartCMD },
                    { name: 'Timestamp:', value: `<t:${timestampCMD.toString()}:F> (<t:${timestampCMD.toString()}:R>)` },
                    { name: 'Additional Info:', value: additionalInfoCMD }
                );

            if (hostCMD != interaction.user) {
                const creatorEmbed = new EmbedBuilder()
                .setTitle('You have created a training for another user.')
                .setDescription(`**When making changes use this id: ${trainingId}.**`)
                .addFields(
                    { name: 'Host Discord ID:', value: id },
                    { name: 'Host Roblox ID:', value: rblxId },
                    { name: 'Host Roblox Username:', value: rblxName },
                    { name: 'Training Type:', value: trainingTypeCMD },
                    { name: 'Scheduled Date in UTC:', value: scheduledDateCMD },
                    { name: 'Scheduled Start in UTC:', value: scheduledStartCMD },
                    { name: 'Timestamp:', value: `<t:${timestampCMD.toString()}:F> (<t:${timestampCMD.toString()}:R>)` },
                    { name: 'Additional Info:', value: additionalInfoCMD }
                );
                client.users.send(interaction.user.id, {
                    embeds: [creatorEmbed]
                });
            };

            const publicEmbed = new EmbedBuilder()
            .setTitle(`New ${trainingTypeCMD} training!`)
            .addFields(
                { name: 'Host:', value: rblxName },
                { name: 'Scheduled Date in UTC:', value: scheduledDateCMD },
                { name: 'Scheduled Start in UTC:', value: scheduledStartCMD },
                { name: 'Timestamp:', value: `<t:${timestampCMD.toString()}:F> (<t:${timestampCMD.toString()}:R>)` },
                { name: 'Additional Info:', value: additionalInfoCMD }
            );
            client.users.send(id, {
                embeds: [trainingEmbed]
            });

            trainingChannel.send({
                content: '<@&1140220447535923200>',
                embeds: [publicEmbed]
            });
    
            interaction.reply({
                content: 'The training has been scheduled.',
                ephemeral: true
            });  
        } catch (error) {
            console.warn(error)
        };

    },
    opTeamOnly: true,

    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};
