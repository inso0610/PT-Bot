const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');

function getRobloxData(id) {
    const functionResult = fetch(`https://api.blox.link/v4/public/guilds/1089282844657987587/discord-to-roblox/${id.toString()}`, { method: "GET", headers: { "Authorization": "66ef19b6-b0f6-41f4-b883-63d833484ac6" } })
	    .then((response) => response.json())
	    .then((data) => {
            try {
                const response = JSON.parse(JSON.stringify(data));

                const robloxID = response.robloxID.toString();
                const username = response.resolved.roblox.name.toString();

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
    .setDescription('Gives you your Discord User id.')
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
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getString('amount');

        const userInfo = await getRobloxData(user.id);

        if (!Array.isArray(userInfo)) {
            console.warn(userInfo)
            interaction.reply({
                content: 'The command failed. Contact Emilsen.',
                ephemeral: true
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
                interaction.reply({
                    content: 'The command failed. Contact Emilsen.',
                    ephemeral: true
                });
                return
            })

            interaction.reply({
                content: 'Message sent.',
                embeds: [ paymentEmbed ],
                ephemeral: true
            });

            console.warn(error);
    },
    gaOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};