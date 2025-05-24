const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

function getRobloxData(id) {
    const functionResult = fetch(`https://api.blox.link/v4/public/guilds/1089282844657987587/discord-to-roblox/${id.toString()}`, { method: "GET", headers: { "Authorization": "66ef19b6-b0f6-41f4-b883-63d833484ac6" } })
	    .then((response) => response.json())
	    .then((data) => {
            try {
                const response = JSON.parse(JSON.stringify(data));

                const robloxID = response.robloxID.toString();
                const username = response.cachedUsername

                const userInfo = [robloxID, username];
                return userInfo;
            } catch (error) {
                console.warn(error);
                return error;
            };
        });
    return functionResult;
};

module.exports = {
    data: new SlashCommandBuilder()
    .setName('pay-message')
    .setDescription('Send a payment message to a user.')
    .setContexts(['Guild'])
    .addUserOption((option) => 
        option
            .setName('user')
            .setDescription('Who should recieve the payment message?')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('amount')
            .setDescription('How much did/will the user recieve?')
            .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getString('amount');

        const userInfo = await getRobloxData(user.id);

        if (!Array.isArray(userInfo)) {
            console.warn(userInfo)
            interaction.editReply({
                content: 'The command failed. Contact Emilsen.',
                flags: MessageFlags.Ephemeral
            });
            return;
        };
        
        const rblxId = userInfo[0];
        const rblxName = userInfo[1];

        const paymentEmbed = new EmbedBuilder()
            .setTitle('Polar Tracks Robux payout')
            .setDescription('Don\'t see it in your Robux total? It is probably on pending and Roblox will give you it once they have checked it for fraud.\n\nWe pay our staff based on activity so it may vary from month to month.\n\nFor more information don\'t hesitate to send any GA a DM.')
            .addFields(
                { name: 'Roblox username:', value: rblxName},
                { name: 'Robux paid:', value: amount}
            )
            .setFooter({
                text: `Payment message for user with id: ${rblxId}`
            });

            client.users.send(user.id, {
                embeds: [ paymentEmbed ]
            }).catch( e=> {
                console.log(e);
                interaction.editReply({
                    content: 'The command failed. Contact Emilsen.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            })

            interaction.editReply({
                content: 'Message sent.',
                embeds: [ paymentEmbed ],
                flags: MessageFlags.Ephemeral
            });
    },
    dirOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};