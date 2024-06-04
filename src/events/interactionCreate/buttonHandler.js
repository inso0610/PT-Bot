const { EmbedBuilder } = require('discord.js');
const model = require('../../utils/trainings.js')

function getRobloxId(id) {
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
                console.log(error);
                return error;
            };
        });
    return functionResult
}

module.exports = async (interaction, client, message) => {
    if(!interaction.isButton()) return;

    if(interaction.customId === "create-training") {
        try {
            const trainingChannel = client.channels.cache.get('1246904420495523925');
    
            const id = interaction.user.id
    
            const userInfo = await getRobloxId(id);
                if (!Array.isArray(userInfo)) {
                    console.log(userInfo)
                    interaction.reply({
                        content: 'The button failed. Contact Emilsen.',
                        ephemeral: true
                    })
                    return
                };
            const rblxId = userInfo[0];
            const rblxName = userInfo[1];
    
            const embed = interaction.message.embeds[0];
            const data = embed.data;
            const title = data.title;
            const fields = data.fields;
    
            const dateFromMsg = fields[1].value;
            const time = fields[2].value;
    
            const trainingType = title.replace(' Training Request', '')
    
            const splitDate = dateFromMsg.split('/');
            const splitTime = time.split(':');
    
            const date = new Date(Date.UTC(splitDate[2], splitDate[1]-1, splitDate[0], splitTime[0], splitTime[1]));
    
            const timestampMilli = date.getTime();
            const timestamp = Math.floor(timestampMilli / 1000);
    
            const newTraining = new model({
                hostDiscordId: id,
                hostRobloxId: rblxId,
                hostRobloxUsername: rblxName,
                trainingType: trainingType,
                date: date,
                timestamp: timestamp.toString(),
                additionalInfo: 'No additional information.'
            });
    
            await newTraining.save();
    
            const trainingId = newTraining._id.toString();
    
            const trainingEmbed = new EmbedBuilder()
                .setTitle('You have been assigned to a training!')
                .setDescription(`**When making changes use this id: ${trainingId}**`)
                .addFields(
                    { name: 'Host Discord ID:', value: id },
                    { name: 'Host Roblox ID:', value: rblxId },
                    { name: 'Host Roblox Username:', value: rblxName },
                    { name: 'Training Type:', value: trainingType },
                    { name: 'Scheduled Date in UTC:', value: dateFromMsg },
                    { name: 'Scheduled Start in UTC:', value: time },
                    { name: 'Timestamp:', value: `<t:${timestamp.toString()}:F> (<t:${timestamp.toString()}:R>)` },
                    { name: 'Additional Info:', value: 'No additional information.' }
                );
                
            const publicEmbed = new EmbedBuilder()
                .setTitle(`New ${trainingType} training!`)
                .addFields(
                    { name: 'Host:', value: rblxName },
                    { name: 'Scheduled Date in UTC:', value: dateFromMsg },
                    { name: 'Scheduled Start in UTC:', value: time },
                    { name: 'Timestamp:', value: `<t:${timestamp.toString()}:F> (<t:${timestamp.toString()}:R>)` },
                    { name: 'Additional Info:', value: 'No additional information.' }
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
            interaction.reply({
                content: 'The button failed. Schedule the training using /schedule-training.',
                ephemeral: true
            });
            console.warn(error);
        };
    } else if(interaction.customId === "test-training-req") {
        const id = interaction.user.id
    
            const userInfo = await getRobloxId(id);
                if (!Array.isArray(userInfo)) {
                    console.log(userInfo)
                    interaction.reply({
                        content: 'The button failed. Contact Emilsen.',
                        ephemeral: true
                    })
                    return
                };
            const rblxName = userInfo[1];
    
            const embed = interaction.message.embeds[0];
            const data = embed.data;
            const title = data.title;
            const fields = data.fields;
    
            const dateFromMsg = fields[1].value;
            const time = fields[2].value;
    
            const trainingType = title.replace(' Training Request', '')
    
            const splitDate = dateFromMsg.split('/');
            const splitTime = time.split(':');
    
            const date = new Date(Date.UTC(splitDate[2], splitDate[1]-1, splitDate[0], splitTime[0], splitTime[1]));
    
            const timestampMilli = date.getTime();
            const timestamp = Math.floor(timestampMilli / 1000);

            const publicEmbed = new EmbedBuilder()
                .setTitle(`New ${trainingType} training!`)
                .addFields(
                    { name: 'Host:', value: rblxName },
                    { name: 'Scheduled Date in UTC:', value: dateFromMsg },
                    { name: 'Scheduled Start in UTC:', value: time },
                    { name: 'Timestamp:', value: `<t:${timestamp.toString()}:F> (<t:${timestamp.toString()}:R>)` },
                    { name: 'Additional Info:', value: 'No additional information.' }
                );
            
            interaction.reply({
                embeds: [publicEmbed],
                ephemeral: true
            });
    };
};