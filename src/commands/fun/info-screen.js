const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const wait = require('node:timers/promises').setTimeout;

const images = './src/utils/images';
const commandTimeout = require('../../utils/commandTimeout');
const { searchStation, getStationData } = require('../../utils/entur');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-screen')
        .setDescription('Get a station information screen or Real Time Display.')
        .setContexts(['Guild'])
        .addStringOption(option =>
            option.setName('station')
                .setDescription('What station do you want to look at?')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('track')
                .setDescription('Show next departure for a specific track.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('content')
                .setDescription('Show arrivals or departures (ignored if track is specified).')
                .setRequired(false)
                .addChoices(
                    { name: 'Departures', value: 'departure' },
                    { name: 'Arrivals', value: 'arrival' }
                ))
        .addStringOption(option =>
            option.setName('layout')
                .setDescription('Landscape or portrait layout (ignored if track is specified).')
                .setRequired(false)
                .addChoices(
                    { name: 'Landscape', value: 'landscape' },
                    { name: 'Portrait', value: 'portrait' }
                ))
        .addStringOption(option =>
            option.setName('notice')
                .setDescription('Show station notices (ignored if track is specified).')
                .setRequired(false)
                .addChoices(
                    { name: 'Yes', value: 'yes' },
                    { name: 'No', value: 'no' }
                )),

    run: async ({ interaction }) => {
        await interaction.deferReply();

        // === Parse options ===
        const stationId = interaction.options.getString('station');
        const track = interaction.options.getString('track');
        const content = interaction.options.getString('content') ?? 'departure';
        const layout = interaction.options.getString('layout') ?? 'landscape';
        const notice = interaction.options.getString('notice') ?? 'yes';

        if (!stationId) {
            return interaction.editReply({ content: 'You must specify a station.' });
        }

        // === Station lookup ===
        let stationCode = stationId;
        let stationData = null;

        if (stationCode.startsWith('NSR:')) {
            stationData = await getStationData(stationId, true, 'RAIL_STATION');
            if (!stationData) {
                return interaction.editReply({ content: 'Could not find station data.' });
            }

            const jbvCode = stationData.keyList?.keyValue?.find(kv => kv.key === 'jbvCode')?.value;
            if (!jbvCode) {
                return interaction.editReply({ content: 'Could not find station code.' });
            }
            stationCode = jbvCode;
        } else {
            stationCode = stationCode.toUpperCase();
        }

        // === Build RTD link ===
        const link = track
            ? `https://rtd.kv.banenor.no/web_client/std?station=${stationCode}&header=no&content=track&track=${track}`
            : `https://rtd.banenor.no/web_client/std?station=${stationCode}&layout=${layout}&content=${content}&notice=${notice}`;

        // === Cooldown handling ===
        const userId = interaction.user.id;
        const isBooster = interaction.member.roles.cache.has('1140760173128982588');
        const isStaff = interaction.member.roles.cache.has('1140260309915938866');

        if (!isBooster && !isStaff) {
            const commandName = 'infoScreens';
            const timeout = await commandTimeout.findOne({ discordId: userId, command: commandName });

            if (timeout) {
                const expirationTimestamp = Math.floor(timeout.expiration.getTime() / 1000);
                return interaction.editReply({
                    content: `${link}\n\nYou must wait until <t:${expirationTimestamp}:t> before using this command again.\n**Server boosters can use this command without cooldown.**`
                });
            }

            const expiration = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours
            await commandTimeout.create({ discordId: userId, command: commandName, expiration });
        }

        // === Create embed ===
        const embed = new EmbedBuilder()
            .setTitle(`🚉 ${stationData?.name || stationCode}`)
            .setURL(link)
            .setColor(0x0078D7)
            .setFooter({ text: 'Source: Bane NOR RTD' })
            .setTimestamp();

        if (stationData) {
            const location = `${stationData.municipality || ''}${stationData.county ? `, ${stationData.county}` : ''}`;
            if (location.trim()) embed.setDescription(location);

            const jbvCode = stationData.keyList?.keyValue?.find(kv => kv.key === 'jbvCode')?.value;
            if (jbvCode) embed.addFields({ name: 'Bane NOR Code', value: jbvCode, inline: true });
        }

        // Dynamic fields depending on whether track is specified
        if (track) {
            embed.addFields({ name: 'Track', value: track, inline: true });
        } else {
            embed.addFields(
                { name: 'Content', value: content.charAt(0).toUpperCase() + content.slice(1), inline: true },
                { name: 'Layout', value: layout.charAt(0).toUpperCase() + layout.slice(1), inline: true },
                { name: 'Notices', value: notice === 'yes' ? 'Yes' : 'No', inline: true },
            );
        }

        // === Puppeteer section ===
        let browser;
        try {
            browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                ignoreDefaultArgs: ['--disable-extensions']
            });

            const page = await browser.newPage();

            const viewport =
                layout === 'portrait' && !track
                    ? { width: 1080, height: 1920, deviceScaleFactor: 1 }
                    : { width: 1920, height: 1080, deviceScaleFactor: 1 };

            await page.setViewport(viewport);
            await page.emulateTimezone('Europe/Oslo');
            await page.goto(link);
            await wait(4000);

            const imagePath = `${images}/screen-${interaction.id}.png`;
            await page.screenshot({ path: imagePath });

            if (fs.existsSync(imagePath)) {
                console.log('Screenshot saved');
                await interaction.editReply({
                    content: link,
                    embeds: [embed],
                    files: [{ attachment: imagePath }]
                });
                fs.unlinkSync(imagePath);
            } else {
                console.log('Screenshot not saved');
                await interaction.editReply({
                    content: link,
                    embeds: [embed]
                });
            }

        } catch (error) {
            console.warn(error);
            await interaction.editReply({
                content: link,
                embeds: [embed]
            });
        } finally {
            if (browser) await browser.close();
        }
    },

    autocomplete: async ({ interaction }) => {
        const focusedValue = interaction.options.getFocused();
        const stations = await searchStation(focusedValue);

        if (!stations?.length) {
            return interaction.respond([]);
        }

        const choices = stations.map(station => ({
            name: station.properties.name,
            value: station.properties.id
        }));

        await interaction.respond(choices.slice(0, 25));
        return choices;
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};
