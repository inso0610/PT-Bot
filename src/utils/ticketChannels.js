//Departments: OPS-<ALL,DM,CM,PM,SM>, COMMUNITY-ALL (Standard), DEV-<ALL,AT,DEV,BOT>, MARKETING-<ALL,SOCIAL,WEB>, SENIOR-<ALL,SA,OM,DEV>
//SPECIAL-RA, DIRECTO-<ALL,MD,OD,ED>, ADVISORS-<ALL,GA,CA,GH>

const tickets = require('./tickets.js');

const ticketChannels = {
    OPS: {
        channel: '1304844118190456964',
        pings: {
            ALL: '1133749323344125992',
            DM: '1089284413684199474',
            CM: '1089284414976049272',
            PM: '1089284411763204197',
            SM: '1089284410332942366'
        }
    },
    COMMUNITY: {
        channel: '1304843841810993214',
        pings: {
            ALL: '1302284945451913308'
        }
    },
    DEV: {
        channel: '1304847708841836564',
        pings: {
            ALL: '1304848035435646986',
            AT: '1224256761335382128',
            DEV: '1089284405379465256',
            BOT: '1304849124528754729'
        }
    },
    MARKETING: {
        channel: '1304845302963896462',
        pings: {
            ALL: '1304845486922006529',
            SOCIAL: '1281956316293763142',
            WEB: '1281956551178981566'
        }
    },
    SENIOR: {
        channel: '1304846910137434182',
        pings: {
            ALL: '1167782024040435752',
            SA: '1089284402791588070',
            OM: '1089284408042848377',
            DEV: '1205914736651145367'
        }
    },
    SPECIAL: {
        channel: '1304849594659635310',
        pings: {
            RA: '1256533116856565802'
        }
    },
    DIRECTOR: {
        channel: '1304850457390354512',
        pings: {
            ALL: '1140260309915938866',
            MD: '1089284398760874104',
            OD: '1089284399830409337',
            ED: '1089284397519347762'
        }
    },
    ADVISOR: {
        channel: '1304850860387602482',
        pings: {
            ALL: '1089284396282032178',
            GA: '1089284398760874104',
            CA: '1294321619149262942',
            GH: '1089284394952441948'
        }
    }
};

const allowedTransfers = ['OPS-ALL', 'OPS-DM', 'OPS-CM', 'OPS-PM', 'OPS-SM', 'COMMUNITY-ALL', 'DEV-ALL', 'DEV-AT', 'DEV-DEV', 'DEV-BOT', 'MARKETING-ALL', 'MARKETING-SOCIAL',
    'MARKETING-WEB', 'SENIOR-ALL', 'SENIOR-SA', 'SENIOR-OM', 'SENIOR-DEV', 'SPECIAL-RA', 'DIRECTOR-ALL', 'DIRECTOR-MD', 'DIRECTOR-OD', 'DIRECTOR-ED', 'ADVISOR-ALL', 'ADVISOR-GA',
    'ADVISOR-CA', 'ADVISOR-GH'];

async function closeTicket(id, interaction, client) {
    const ticket = await tickets.findByIdAndDelete(id).exec();

    if (!ticket) {
        interaction.reply({
            content: 'This ticket is already closed.',
            ephemeral: true
        });
        return;
    };

    const departmentSplit = ticket.department.split('-')

    const category = ticketChannels[departmentSplit[0]]

    const channel = client.channels.cache.get(category.channel);

    const ticketMessage = await channel.messages.fetch(ticket.ticketMessageId);

    ticketMessage.delete();

    const ticketCreator = await client.users.fetch(ticket.creatorId);

    if (!ticketCreator) {
        return interaction.reply({
            content: 'Could not find the user.',
            ephemeral: true
        });
    };

    ticketCreator.send(`The ticket with the id \`${String(ticket._id)}\` was closed by <@${interaction.user.id}>`).catch(e => {
        console.warn(e);
        return interaction.reply({
            content: 'Something went wrong. Contact Emilsen.',
            ephemeral: true
        });
    });

    const claimedUser = await client.users.fetch(ticket.claimedId);

    if (!claimedUser) {
        return interaction.reply({
            content: 'Could not find the user.',
            ephemeral: true
        });
    };

    claimedUser.send(`The ticket with the id \`${String(ticket._id)}\` was closed by <@${interaction.user.id}>`).catch(e => {
        console.warn(e);
        return interaction.reply({
            content: 'Something went wrong. Contact Emilsen.',
            ephemeral: true
        });
    });

    interaction.reply({
        content: 'The ticket was closed.',
        ephemeral: true
    });
};

module.exports = { ticketChannels, allowedTransfers, closeTicket };

//Departments: OPS-<ALL,DM,CM,PM,SM>, COMMUNITY-ALL (Standard), DEV-<ALL,AT,DEV,BOT>, MARKETING-<ALL,SOCIAL,WEB>, SENIOR-<ALL,SA,OM,DEV>
//SPECIAL-RA, DIRECTOR-<ALL,MD,OD,ED>, ADVISOR-<ALL,GA,CA,GH>