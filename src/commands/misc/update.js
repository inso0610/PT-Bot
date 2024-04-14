const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Update\'s your Discord roles.'),


    run: async ({ interaction, client, handler }) => {
        /*
        Right way to update:

        fetch(`https://api.blox.link/v4/public/guilds/1089282844657987587/update-user/${interaction.user.id}`, { method: "POST", headers: { "Authorization": "66ef19b6-b0f6-41f4-b883-63d833484ac6" } })
            .then((response) => response.json())
            .then((data) => console.log(data));*/

        const logChannel = client.channels.cache.get('1213594805012013076');

        await interaction.deferReply({
            content: 'Wait...',
            ephemeral: true
        });

        fetch(`https://api.blox.link/v4/public/guilds/1089282844657987587/update-user/${interaction.user.id}`, { method: "POST", headers: { "Authorization": "66ef19b6-b0f6-41f4-b883-63d833484ac6" } })
            .then((response) => response.json())
            .then((data) => { 
                try {
                    const response = JSON.parse(JSON.stringify(data));

                    let addedRoles = 'No roles added.'
                    let removedRoles = 'No roles removed.'
                    let error = 'No errors recived from Bloxlink API.'

                    console.log(response);

                    if (response.hasOwnProperty('error')) {
                        error = response.error.toString();
                    };

                    if (response.addedRoles[0] != undefined) {
                        addedRoles = response.addedRoles.toString();
                    };

                    if (response.removedRoles[0] != undefined) {
                        removedRoles = response.removedRoles.toString();
                    };
                    
                    const nickname = response.nickname;
                    const robloxID = response.robloxID;

                    console.log(addedRoles);
                    console.log(removedRoles);
                    console.log(nickname);
                    console.log(robloxID);
                    console.log(error);

                    const updateEmbed = new EmbedBuilder()
                        .setTitle(`Updated ${interaction.user.tag}!`)
                        .setDescription(`Succesfully updated you to ${robloxID}!`)
                        .addFields(
                            { name: 'Added Roles:', value: addedRoles },
                            { name: 'Removed Roles:', value: removedRoles },
                            { name: 'Nickname:', value: nickname },
                            { name: 'Error:', value: error }
                        );

                    interaction.editReply({
                        embeds: [updateEmbed],
                        ephemeral: true
                    });

                    logChannel.send({embeds: [updateEmbed]});
                
                } catch (error) {
                    interaction.editReply({
                        content: 'Command failed, you may not be verified with Bloxlink. Use /verify to verify.',
                        ephemeral: true
                    });
                    console.log(error);
                };
        });
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};