const { SlashCommandBuilder } = require('discord.js');
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
                .setDescription('Do you want to see the next departure for a specific track? Type in the track number.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('content')
                .setDescription('Do you want to see arrivals or departures? (Does not do anything with track is specified)')
                .setRequired(false)
                .addChoices(
                    { name: 'Departures', value: 'departure' },
                    { name: 'Arrivals', value: 'arrival' }
                ))
        .addStringOption(option =>
            option.setName('layout')
                .setDescription('Should the screen be in landscape or portrait mode? (Does not do anything with track is specified)')
                .setRequired(false)
                .addChoices(
                    { name: 'Landscape', value: 'landscape' },
                    { name: 'Portrait', value: 'portrait' }
                ))
        .addStringOption(option =>
            option.setName('notice')
                .setDescription('Should station notices show up? (Does not do anything with track specified)')
                .setRequired(false)
                .addChoices(
                    { name: 'Yes', value: 'yes' },
                    { name: 'No', value: 'no' }
                )),

    run: async ({ interaction }) => {
        await interaction.deferReply();

        const stationId = interaction.options.getString('station');
        const track = interaction.options.getString('track') ?? null;
        const content = interaction.options.getString('content') ?? 'departure';
        const layout = interaction.options.getString('layout') ?? 'landscape';
        const notice = interaction.options.getString('notice') ?? 'yes';

        if (!stationId) {
            await interaction.editReply({ content: 'You must specify a station.' });
            return;
        }

        let stationCode = stationId;

        if (stationCode.startsWith('NSR:')) {
            const stationData = await getStationData(stationId, true, 'RAIL_STATION');

            if (!stationData) {
                await interaction.editReply({ content: 'Could not find station data.' });
                return;
            }

            stationCode = stationData.keyList?.keyValue?.find(kv => kv.key === 'jbvCode')?.value;
            if (!stationCode) {
                await interaction.editReply({ content: 'Could not find station code.' });
                return;
            };
        } else {
            stationCode = stationCode.upperCase();
        };

        let link = track === null
            ? `https://rtd.banenor.no/web_client/std?station=${stationCode}&layout=${layout}&content=${content}&notice=${notice}`
            : `https://rtd.kv.banenor.no/web_client/std?station=${stationCode}&header=no&content=track&track=${track}`;

        // Check for cooldown unless user has role
        if (!interaction.member.roles.cache.has('1140760173128982588') && !interaction.member.roles.cache.has('1140260309915938866')) {
            const commandName = interaction.commandName;
            const userId = interaction.user.id;

            const timeout = await commandTimeout.findOne({
                discordId: userId,
                command: commandName
            });

            if (timeout) {
                await interaction.editReply({
                    content: `${link}\n\n\You have to wait until <t:${Math.floor(timeout.expiration.getTime() / 1000)}:t> if you want to get an image from this command. **Server boosters can use this command without cooldown.**`
                });
                return;
            }

            const expiration = Date.now() + 3 * 60 * 60 * 1000;
            const newTimeout = await commandTimeout.create({
                discordId: userId,
                command: commandName,
                expiration: expiration
            });

            await newTimeout.save();
        }

        let browser;

        try {
            browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                ignoreDefaultArgs: ['--disable-extensions']
            });

            const page = await browser.newPage();

            if (layout === 'landscape' || track !== null) {
                await page.setViewport({
                    width: 1920,
                    height: 1080,
                    deviceScaleFactor: 1
                });
            } else if (layout === 'portrait') {
                await page.setViewport({
                    width: 1080,
                    height: 1920,
                    deviceScaleFactor: 1
                });
            }

            page.emulateTimezone('Europe/Oslo');
            await page.goto(link);
            await wait(4000);

            const imagePath = `${images}/screen-${interaction.id}.png`;
            await page.screenshot({ path: imagePath });

            if (fs.existsSync(imagePath)) {
                console.log("Screenshot saved");

                await interaction.editReply({
                    content: link,
                    files: [{ attachment: imagePath }]
                });

                fs.unlinkSync(imagePath);
            } else {
                console.log("Screenshot not saved");
                await interaction.editReply({ content: link });
            }

        } catch (error) {
            console.warn(error);
            await interaction.editReply({ content: link });
        } finally {
            if (browser) await browser.close();
        }
    },

    autocomplete: async ({ interaction, client, handler }) => {
        const focusedValue = interaction.options.getFocused();

        const stations = await searchStation(focusedValue);

        if (!stations || stations.length === 0) {
            return interaction.respond([]);
        }

        const choices = stations.map(station => ({
            name: station.properties.name,
            value: station.properties.id
        }));

        interaction.respond(choices.slice(0, 25));
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
