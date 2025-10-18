const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const fs = require('fs');

const images = './src/utils/images';
const commandTimeout = require('../../utils/commandTimeout');
const { searchStation, getStationData } = require('../../utils/entur');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-screen')
        .setDescription('Get a station information screen or Real Time Display.')
        .setContexts(['Guild'])
        .addStringOption(opt => opt
            .setName('station')
            .setDescription('Which station do you want to look at?')
            .setRequired(true)
            .setAutocomplete(true))
        .addStringOption(opt => opt
            .setName('track')
            .setDescription('Show next departure for a specific track (optional).')
            .setRequired(false))
        .addStringOption(opt => opt
            .setName('content')
            .setDescription('Show arrivals or departures (ignored if track is specified).')
            .setRequired(false)
            .addChoices(
                { name: 'Departures', value: 'departure' },
                { name: 'Arrivals', value: 'arrival' }
            ))
        .addStringOption(opt => opt
            .setName('layout')
            .setDescription('Landscape or portrait layout (ignored if track is specified).')
            .setRequired(false)
            .addChoices(
                { name: 'Landscape', value: 'landscape' },
                { name: 'Portrait', value: 'portrait' }
            ))
        .addStringOption(opt => opt
            .setName('notice')
            .setDescription('Show station notices (ignored if track is specified).')
            .setRequired(false)
            .addChoices(
                { name: 'Yes', value: 'yes' },
                { name: 'No', value: 'no' }
            )),

    run: async ({ interaction }) => {
        await interaction.deferReply();

        const stationInput = interaction.options.getString('station');
        const track = interaction.options.getString('track') ?? null;
        const content = interaction.options.getString('content') ?? 'departure';
        const layout = interaction.options.getString('layout') ?? 'landscape';
        const notice = interaction.options.getString('notice') ?? 'yes';

        if (!stationInput) return interaction.editReply({ content: 'You must specify a station.' });

        // --- Fetch station data ---
        let stationData = null;
        let stationCode = stationInput;
        let locationInfoAvailable = true;

        if (stationInput.startsWith('NSR:')) {
            stationData = await getStationData(stationInput, true, 'RAIL_STATION');
            if (!stationData) return interaction.editReply({ content: 'Could not find station data.' });

            const jbv = stationData.keyList?.keyValue?.find(kv => kv.key === 'jbvCode')?.value;
            if (!jbv) return interaction.editReply({ content: 'Could not find station code.' });

            stationCode = jbv;
        } else {
            stationCode = stationInput.toUpperCase();
            locationInfoAvailable = false;
        }

        // --- Build RTD link ---
        const link = track
            ? `https://rtd.kv.banenor.no/web_client/std?station=${stationCode}&header=no&content=track&track=${track}`
            : `https://rtd.banenor.no/web_client/std?station=${stationCode}&layout=${layout}&content=${content}&notice=${notice}`;

        // --- Check cooldown ---
        const userId = interaction.user.id;
        const hasNoCooldownRole = interaction.member.roles.cache.has('1140760173128982588') ||
            interaction.member.roles.cache.has('1140260309915938866');

        let cooldownField = null;
        let onCooldown = false;

        if (!hasNoCooldownRole) {
            const commandName = 'infoScreens';
            const timeout = await commandTimeout.findOne({ discordId: userId, command: commandName });

            if (timeout) {
                const expiration = Math.floor(timeout.expiration.getTime() / 1000);
                cooldownField = { name: 'Image cooldown', value: `\n\nYou must wait until <t:${expiration}:t> before getting an image from this command again.\n**Server boosters can use this command without cooldown.**`, inline: false };
                onCooldown = true; // markerer at vi har cooldown
            } else {
                const expiration = new Date(Date.now() + 3 * 60 * 60 * 1000);
                await commandTimeout.create({ discordId: userId, command: commandName, expiration });
            }
        }

        // --- Build info embed ---
        const embed = new EmbedBuilder()
            .setTitle(`🚉 ${stationData?.name?.value || stationCode}`)
            .setURL(link)
            .setColor(0x0078D7)
            .setFooter({ text: 'Source: Bane NOR RTD and National Stop Register (NSR)' })
            .setTimestamp();

        const fields = [
            { name: 'Station Code', value: stationCode, inline: true },
            { name: 'Content', value: content.charAt(0).toUpperCase() + content.slice(1), inline: true },
            { name: 'Layout', value: layout.charAt(0).toUpperCase() + layout.slice(1), inline: true },
            { name: 'Notices', value: notice === 'yes' ? 'Yes' : 'No', inline: true }
        ];

        if (track) fields.push({ name: 'Track', value: track, inline: true });

        if (locationInfoAvailable && stationData) {
            const formatBool = (val) => {
                if (val === 'TRUE' || val === true) return 'Yes';
                if (val === 'FALSE' || val === false) return 'No';
                return 'Unknown';
            };

            const access = stationData.accessibilityAssessment?.limitations?.accessibilityLimitation;
            if (access) {
                fields.push({
                    name: 'Accessibility',
                    value: `Mobility Impaired: ${formatBool(stationData.accessibilityAssessment.mobilityImpairedAccess)}\n` +
                        `Wheelchair Access: ${formatBool(access.wheelchairAccess)}\n` +
                        `Step-Free Access: ${formatBool(access.stepFreeAccess)}\n` +
                        `Escalator-Free Access: ${formatBool(access.escalatorFreeAccess)}\n` +
                        `Lift-Free Access: ${formatBool(access.liftFreeAccess)}\n` +
                        `Audible Signals: ${formatBool(access.audibleSignalsAvailable)}`,
                    inline: false
                });
            }

            const placeEquipmentsList = stationData.placeEquipments?.installedEquipmentRefOrInstalledEquipment || [];

            const sanitaryEquipment = placeEquipmentsList.find(eq => eq.type === 'SanitaryEquipment');
            if (sanitaryEquipment) {
                const numberOfToilets = sanitaryEquipment.value?.numberOfToilets ?? 'Unknown';
                const toiletGender = sanitaryEquipment.value?.gender ?? 'Unknown';

                fields.push({
                    name: 'Sanitary Equipment',
                    value: `Number of Toilets: ${numberOfToilets}\nGender: ${toiletGender}`,
                });
            }

            const waitingRoomEquipment = placeEquipmentsList.find(eq => eq.type === 'WaitingRoomEquipment');
            if (waitingRoomEquipment) {
                const seats = waitingRoomEquipment.value?.seats ?? 'Unknown';
                const stepFree = formatBool(waitingRoomEquipment.value?.stepFree);
                const heated = formatBool(waitingRoomEquipment.value?.heated);

                fields.push({
                    name: 'Waiting Room',
                    value: `Seats: ${seats}\nStep-Free Access: ${stepFree}\nHeated: ${heated}`,
                });
            }

            const ticketingEquipment = placeEquipmentsList.find(eq => eq.type === 'TicketingEquipment');
            if (ticketingEquipment) {
                const ticketMachines = formatBool(ticketingEquipment.value?.ticketMachines);
                const numberOfMachines = ticketingEquipment.value?.numberOfMachines ?? 'Unknown';
                const ticketOffice = formatBool(ticketingEquipment.value?.ticketOffice);

                fields.push({
                    name: 'Ticketing',
                    value: `Ticket Machines: ${ticketMachines} (Number: ${numberOfMachines})\nTicket Office: ${ticketOffice}`,
                });
            }

            const latitude = stationData.centroid?.location?.latitude || 'Unknown';
            const longitude = stationData.centroid?.location?.longitude || 'Unknown';

            fields.push(
                { name: 'Latitude', value: latitude.toString(), inline: true },
                { name: 'Longitude', value: longitude.toString(), inline: true }
            );
        } else {
            fields.push({
                name: 'Location / Accessibility',
                value: 'Not supported when station code is typed directly',
                inline: false
            });

            embed.setFooter({ text: 'Source: Bane NOR RTD' });
        }

        if (cooldownField) fields.push(cooldownField);

        embed.addFields(fields);

        // --- Send embed always ---
        await interaction.editReply({ embeds: [embed] });

        // --- Only generate screenshot if not on cooldown ---
        if (!onCooldown) {
            let browser;
            try {
                browser = await puppeteer.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                    ignoreDefaultArgs: ['--disable-extensions']
                });

                const page = await browser.newPage();
                await page.setViewport(track || layout === 'landscape'
                    ? { width: 1920, height: 1080, deviceScaleFactor: 1 }
                    : { width: 1080, height: 1920, deviceScaleFactor: 1 }
                );
                await page.emulateTimezone('Europe/Oslo');
                await page.goto(link, { waitUntil: 'networkidle0' });

                const imagePath = `${images}/screen-${interaction.id}.png`;
                await page.screenshot({ path: imagePath });
                const hasImage = fs.existsSync(imagePath);

                if (hasImage) {
                    await interaction.editReply({
                        embeds: [embed],
                        files: [{ attachment: imagePath }]
                    });
                    fs.unlinkSync(imagePath);
                }

            } catch (err) {
                console.warn(err);
            } finally {
                if (browser) await browser.close();
            }
        }
    },

    autocomplete: async ({ interaction }) => {
        const focused = interaction.options.getFocused();
        const stations = await searchStation(focused);
        if (!stations?.length) return interaction.respond([]);

        const choices = stations.map(s => ({ name: s.properties.name, value: s.properties.id }));
        await interaction.respond(choices.slice(0, 25));
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false
    }
};
