const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const model = require('../../utils/trainings.js')

const tickets = require('../../utils/tickets.js');

const { ticketChannels, allowedTransfers, closeTicket } = require( '../../utils/ticketChannels.js');

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
    return functionResult;
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

async function postToTrello(idList, name, description) {
    /*const apiKey = '553fb5ca7278c746c740cfdeac53998f';
    const apiToken = 'ATTAf286dc31c96fbd551ee76d0dfd76f85944a375a878d5ec0b74ed236753bb4b79988EF45F';

    const functionResult = fetch(`https://api.trello.com/1/cards?idList=${idList}&key=${apiKey}&token=${apiToken}&name=${name}&desc=${description}`, {
        method: 'POST',
        headers: {'Accept': 'application/json'}
    });*/

    const apiKey = 'pk_152548784_D7XNOTUV0P985AOUT0RCH4VKG1QD642V'

    const query = new URLSearchParams({
        custom_task_ids: 'false',
    }).toString();

    const resp = await fetch(
        `https://api.clickup.com/api/v2/list/${idList}/task?${query}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: apiKey
            },
            body: JSON.stringify({
                name: name,
                description: description,
                tags: ['suggestion'],
                status: 'ACCEPTED SUGGESTIONS',
            })
        }
    );
};

module.exports = async (interaction, client) => {
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
    /*} else if (interaction.customId === 'roadMapInfo') {
        const embed = new EmbedBuilder()
            .setTitle('Roadmap')
            .setDescription('# Check out what we are working on, here')
            .addFields(
                { name: 'Engineering and Technology:', value: 'https://trello.com/b/eA59AXF4/engineering-and-technology-board' },
                { name: 'Operations:', value: 'https://trello.com/b/cyYBEanG/operations-board' },
                { name: 'Community Team:', value: 'https://trello.com/b/BpFQHHBE/customer-experience-board' }
            );

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });*/
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
                { name: 'L1:', value: 'https://docs.google.com/document/d/1KdJnZOdQn5uyjU_FCjHu6nuXu_i0GRlN_6yHUwcsKTw/edit?usp=drive_link' },
                { name: 'L2:', value: 'https://docs.google.com/document/d/1VKi7F_Sn_alyazmH6qdd2WC7qV9kc7EVzNfuoQS2lVk/edit?usp=drive_link' },
                { name: 'R31:', value: 'https://docs.google.com/document/d/1dmz2yEmj2FCHWZ8HaEyJAnsob8CV3sYOoQzPv8ca7BA/edit?usp=drive_link' },
                { name: 'RE10:', value: 'https://docs.google.com/document/d/1CoQeuLaDlvikQgbIGzsnK203TfgZQyhfQo7nePNMgAk/edit?usp=drive_link' },
                { name: 'RE30:', value: 'https://docs.google.com/document/d/1vsjMlxaCjoGRTAx8qkLmjuF24FMncLovNs4qZLnXRFg/edit?usp=drive_link' }
            );

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    } else if (interaction.customId === 'acceptSuggestion') {
        if (!interaction.member.roles.cache.has('1089284397519347762') && !interaction.member.roles.cache.has('1089284396282032178')) {
            interaction.reply({
                content: 'You do not have access to this button.',
                ephemeral: true
            });

            return true;
        };

        try {
            // Base variables
            const acceptedSuggestions = client.channels.cache.get('1251895090952015914');
    
            // Variables from message
            const message = interaction.message;
    
            const messageComponets = message.components[0].components;
            const acceptButton = messageComponets[0];
            const declineButton = messageComponets[1];
            const emAcceptButton = messageComponets[2];
   
            const embed = message.embeds[0];
            const embedData = embed.data;
            const title = embedData.title;
            const description = embedData.description;
            const footer = embedData.footer;
            const authorName = embedData.author.name;
   
            const thread = await client.channels.fetch(message.id);
   
            // code
            acceptButton.data.disabled = true;
            declineButton.data.disabled = true;
            emAcceptButton.data.disabled = true;
    
            const row = new ActionRowBuilder()
                .addComponents(acceptButton, declineButton, emAcceptButton);
    
            interaction.message.edit({
                components: [row]
            });
    
            acceptedSuggestions.send({
                content: `Accepted suggestion. Accepted by <@${interaction.user.id}>`,
                embeds: [embed]
            });
    
            thread.send(`<@${footer.text}> your suggestion was accepted!`);
        
            interaction.reply({
                content: 'Suggestion accepted.',
                ephemeral: true
            });
    
            const trelloTitle = `${title} - ${authorName}`;
    
            postToTrello('901205295987', trelloTitle, description);
        } catch (error) {
            interaction.reply({
                content: 'Button failed. Please try again later or contact Emilsen.',
                ephemeral: true
            });
            console.warn(error)
        };
    } else if (interaction.customId === 'declineSuggestion') {
        if (!interaction.member.roles.cache.has('1089284397519347762') && !interaction.member.roles.cache.has('1089284396282032178') && !interaction.member.roles.cache.has('1302284945451913308')) {
            interaction.reply({
                content: 'You do not have access to this button.',
                ephemeral: true
            });
            return true;
        };

        try {
            // Variables from message
            const message = interaction.message;
    
            const messageComponets = message.components[0].components;
            const acceptButton = messageComponets[0];
            const declineButton = messageComponets[1];
            const emAcceptButton = messageComponets[2];
    
            const embed = message.embeds[0];
            const embedData = embed.data;
            const footer = embedData.footer;
    
            const thread = await client.channels.fetch(message.id);
    
            // code
            acceptButton.data.disabled = true;
            declineButton.data.disabled = true;
            emAcceptButton.data.disabled = true;
    
            const row = new ActionRowBuilder()
                .addComponents(acceptButton, declineButton, emAcceptButton);
    
            interaction.message.edit({
                components: [row]
            });
            
            thread.send(`<@${footer.text}> your suggestion was declined.`);
    
            interaction.reply({
                content: 'Suggestion declined.',
                ephemeral: true
            });
        } catch (error) {
            interaction.reply({
                content: 'Button failed. Please try again later or contact Emilsen.',
                ephemeral: true
            });
            console.warn(error)
        }
    } else if (interaction.customId === 'acceptSuggestion-EM') {
        if (!interaction.member.roles.cache.has('1302284945451913308')) {
            interaction.reply({
                content: 'You do not have access to this button.',
                ephemeral: true
            });

            return true;
        };

        try {
            // Base variables
            const acceptedSuggestions = client.channels.cache.get('1302286236995813467');
    
            // Variables from message
            const message = interaction.message;
    
            const messageComponets = message.components[0].components;
            const acceptButton = messageComponets[0];
            const declineButton = messageComponets[1];
            const emAcceptButton = messageComponets[2];
    
            const embed = message.embeds[0];
            const embedData = embed.data;
            const footer = embedData.footer;
    
            const thread = await client.channels.fetch(message.id);
    
            // code
            acceptButton.data.disabled = true;
            declineButton.data.disabled = true;
            emAcceptButton.data.disabled = true;
    
            const row = new ActionRowBuilder()
                .addComponents(acceptButton, declineButton, emAcceptButton);
    
            interaction.message.edit({
                components: [row]
            });
    
            acceptedSuggestions.send({
                content: `Accepted Community suggestion. Accepted by <@${interaction.user.id}>`,
                embeds: [embed]
            });
    
            thread.send(`<@${footer.text}> your suggestion was accepted!`);
        
            interaction.reply({
                content: 'Suggestion accepted.',
                ephemeral: true
            });
        } catch (error) {
            interaction.reply({
                content: 'Button failed. Please try again later or contact Emilsen.',
                ephemeral: true
            });
            console.warn(error)
        };
    } else if (interaction.customId === 'claimTicket') {
        const message = interaction.message;

        const ticket = await tickets.findOne({ticketMessageId: message.id}).exec()

        if (!ticket) {
            interaction.reply({
                content: 'The claiming failed. Please contact Emilsen so he can claim it manually for you.',
                ephemeral: true
            });
            return;
        };

        ticket.claimedId = interaction.user.id;

        //const departmentSplit = ticket.department.split('-')

        //const category = ticketChannels[departmentSplit[0]]

        //const pings = category.pings;

        const ticketEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket')
            .setDescription(`Claimed by: ${interaction.user.username}`)
            .addFields(
                {name: 'ID', value: String(ticket._id)},
                {name: 'Topic', value: ticket.topic},
                {name: 'Important note', value: ticket.importantNote},
                {name: 'Creator', value: ticket.creatorUsername},
                {name: 'Department', value: ticket.department},
                {name: 'Language', value: ticket.language}
            );

        message.edit({
            //content: `<@&${pings[departmentSplit[1]]}>`,
            embeds: [ticketEmbed],
            components: []
        });

        ticket.log.push(`<@${interaction.user.id}> claimed this ticket.`);

        ticket.save();

        const ticketCreator = await client.users.fetch(ticket.creatorId);

        if (!ticketCreator) {
            interaction.reply({
                content: 'Could not find the ticket creator.',
                ephemeral: true
            });
            return;
        };

        ticketCreator.send(`Your ticket with the id: \`${String(ticket._id)}\` has been claimed by <@${interaction.user.id}>.\nTo reply to the ticket you have to add this anywhere in the message: [${String(ticket._id)}].`).catch(e => {
            console.warn(e)
            interaction.reply({
                content: 'The ticket creator may not be able to see your replies, please contact Emilsen.',
                ephemeral: true
            });
            return;
        });

        const claimedTicketMessage = new EmbedBuilder()
            .setTitle('Claimed ticket')
            .setDescription(`Ticket id: ${String(ticket._id)}`)
            .addFields(
                { name: 'Department', value: ticket.department },
                { name: 'Topic', value: ticket.topic },
                { name: 'Created by', value: ticket.creatorUsername }
            );

        const ticketCommands = new EmbedBuilder()
            .setTitle('Ticket commands')
            .addFields(
                { name: `\`/ticket reply ${String(ticket._id)} (message) (prompt)\``, value: 'Send a reply to the creator of the ticket. If you want to prompt the person to close the ticket set prompt to true.'},
                { name: `\`/ticket note ${String(ticket._id)} (message) (important)\``, value: 'Add a note to the ticket. If you set important to true it will be set as the important note.'},
                { name: `\`/ticket questions ${String(ticket._id)}\``, value: 'Sends the questions sent by the ticket creator.'},
                { name: `\`/ticket unassign ${String(ticket._id)}\``, value: 'Unassigns you and makes the ticket claimable for someone else.'},
                { name: `\`/ticket transfer ${String(ticket._id)} (new category)\``, value: 'Transfers the ticket to a new department.'},
                { name: `\`/ticket logs ${String(ticket._id)}\``, value: 'Sends the ticket logs.'},
                { name: `\`/ticket info ${String(ticket._id)}\``, value: 'Send the ticket information.'},
                { name: `\`/ticket notes ${String(ticket._id)}\``, value: 'Sends all ticket notes.'},
                { name: `\`/ticket close ${String(ticket._id)}\``, value: 'Closes the ticket.'}
            );

        interaction.user.send({
            embeds: [claimedTicketMessage, ticketCommands]
        }).catch(e => {
            interaction.reply({
                content: `I could not send you the ticket information. Do \`/ticket info ${String(ticket._id)}\` to send it manually.`,
                ephemeral: true
            });

            console.warn(e);

            return;
        });

        interaction.reply({
            content: 'The ticket has been claimed. Please check your DMs.',
            ephemeral: true
        })
    } else if (interaction.customId === 'closeTicket-Yes') {
        const message = interaction.message;
    
        const messageComponets = message.components[0].components;
        const yesButton = messageComponets[0];
        const noButton = messageComponets[1];

        const embed = message.embeds[0];
        const embedData = embed.data;
        const footer = embedData.footer;

        closeTicket(footer.text, interaction, client)

        yesButton.data.disabled = true;
        noButton.data.disabled = true;

        const row = new ActionRowBuilder()
            .addComponents(yesButton, noButton);
    
        message.edit({
            components: [row]
        });
    } else if (interaction.customId === 'closeTicket-No') {
        const message = interaction.message;
    
        const messageComponets = message.components[0].components;
        const yesButton = messageComponets[0];
        const noButton = messageComponets[1];

        const embed = message.embeds[0];
        const embedData = embed.data;
        const footer = embedData.footer;

        yesButton.data.disabled = true;
        noButton.data.disabled = true;

        const row = new ActionRowBuilder()
            .addComponents(yesButton, noButton);
    
        message.edit({
            components: [row]
        });

        interaction.reply({
            content:'Ticket closure canceled.',
            ephemeral: true
        });
    };
};
