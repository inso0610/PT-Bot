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
};

function scheduleTeamup(startDate, type, host) {
    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + 60);

    const startISO = startDate.toISOString().replace('.000','')
    const endISO = endDate.toISOString().replace('.000','')

    let subcalendar

    if (type === 'Driver') {
        subcalendar = 13324153
    } else if (type === 'Conductor') {
        subcalendar = 13324155
    } else if (type === 'Dispatcher') {
        subcalendar = 13324157
    } else if (type === 'Signaller') {
        subcalendar = 13324160
    };

    const jsondata = {subcalendar_ids: [subcalendar], start_dt: startISO, end_dt: endISO, title: `${type} training`, who: host, signup_enabled: false, comments_enabled: false};

    const options = {
        method: "POST", 
        headers: {
            "Content-Type": "application/json",
            "Teamup-Token": process.env.TEAMUP_TOKEN, 
            "Authorization": process.env.TEAMUP_LOGIN
        },
        body: JSON.stringify(jsondata)
    };

    const functionResult = fetch('https://api.teamup.com/335ezp/events', options)
        .then((response) => response.json())
        .then((data) => {
            try {
                const responseData = JSON.parse(JSON.stringify(data));
    
                return responseData.event.id;
            } catch (error) {
                console.warn(JSON.parse(JSON.stringify(data)));
                return 'Error';
            };
        });

    return functionResult;
};

module.exports = async (interaction, client, message) => {
    if(!interaction.isButton()) return;

    if(interaction.customId === "create-training") {
        interaction.deferReply({
            ephemeral: true
        });

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

            const teamupId = await scheduleTeamup(date, trainingType, rblxName); 
    
            const newTraining = new model({
                hostDiscordId: id,
                hostRobloxId: rblxId,
                hostRobloxUsername: rblxName,
                trainingType: trainingType,
                date: date,
                timestamp: timestamp.toString(),
                additionalInfo: 'No additional information.',
                teamupId: teamupId
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
        
            interaction.editReply({
                content: 'The training has been scheduled.',
                ephemeral: true
            });
        } catch (error) {
            interaction.editReply({
                content: 'The button failed. Schedule the training using /schedule-training.',
                ephemeral: true
            });
            console.warn(error);
        };
    } else if(interaction.customId === "test-training-req") {
        interaction.deferReply({
            ephemeral: true
        });

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
            
            interaction.editReply({
                embeds: [publicEmbed],
                ephemeral: true
            });
    } else if (interaction.customId === 'roadMapInfo') {
        const embed = new EmbedBuilder()
            .setTitle('Roadmap')
            .setDescription('# Check out what we are working on here')
            .addFields(
                { name: 'Engineering and Technology:', value: 'https://trello.com/b/eA59AXF4/engineering-and-technology-board' },
                { name: 'Operations:', value: 'https://trello.com/b/cyYBEanG/operations-board' },
                { name: 'Customer Experience:', value: 'https://trello.com/b/BpFQHHBE/customer-experience-board' }
            );

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    } else if (interaction.customId === 'socialMediaInfo') {
        const embed = new EmbedBuilder()
            .setTitle('Roadmap')
            .setDescription('# Check us out on Social Media')
            .addFields(
                { name: 'Instagram:', value: 'https://www.instagram.com/polartracks.rblx/' },
                { name: 'TikTok:', value: 'https://www.tiktok.com/@polartracks.rblx' },
                { name: 'YouTube:', value: 'https://youtube.com/@PolarTracksRBLX?si=y1R5eZnebfrtY6BN' }
            );

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

    } else if (interaction.customId === 'routesInfo') {
        const embed = new EmbedBuilder()
            .setTitle('Routes')
            .addFields(
                { name: 'L1:', value: 'https://docs.google.com/document/d/1KdJnZOdQn5uyjU_FCjHu6nuXu_i0GRlN_6yHUwcsKTw/edit?usp=drivesdk' },
                { name: 'R31:', value: 'https://docs.google.com/document/d/1dmz2yEmj2FCHWZ8HaEyJAnsob8CV3sYOoQzPv8ca7BA/edit?usp=drivesdk' },
                { name: 'RE10:', value: 'https://docs.google.com/document/d/1vsjMlxaCjoGRTAx8qkLmjuF24FMncLovNs4qZLnXRFg/edit?usp=drivesdk' },
                { name: 'RE30:', value: 'https://docs.google.com/document/d/1CoQeuLaDlvikQgbIGzsnK203TfgZQyhfQo7nePNMgAk/edit?usp=sharing' }
            );

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    };
};
