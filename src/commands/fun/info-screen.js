const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const wait = require('node:timers/promises').setTimeout;

const images = './src/utils/images';
//const stationCodes = require('../../utils/trainings.js');

const commandTimeout = require('../../utils/commandTimeout');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-screen')
        .setDescription('Get a station information screen or Real Time Display.')
        .setContexts(['Guild'])
        .addStringOption((option) =>
            option
                .setName('station')
                .setDescription('What station do you want to look at? This is based on station codes.')
                .setRequired(true))
        .addStringOption((option) =>
            option
                .setName('track')
                .setDescription('Do you want to see the next departure for a specific track? Type in the track number.')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('content')
                .setDescription('Do you want to see arrivals or departures? (Does not do anything with track is specified)')
                .setRequired(false)
                .addChoices(
                    { name: 'Departures', value: 'departure' },
                    { name: 'Arrivals', value: 'arrival' }
                ))
        .addStringOption((option) =>
            option
                .setName('layout')
                .setDescription('Should the screen be in landscape or portrait mode? (Does not do anything with track is specified)')
                .setRequired(false)
                .addChoices(
                    { name: 'Landscape', value: 'landscape' },
                    { name: 'Portrait', value: 'portrait' }
                ))
        .addStringOption((option) =>
            option
                .setName('notice')
                .setDescription('Should station notices show up? (Does not do anything with track specified)')
                .setRequired(false)
                .addChoices(
                    { name: 'Yes', value: 'yes' },
                    { name: 'No', value: 'no' }
                )),

    run: async ({ interaction, client, handler }) => {
        // check if user has role
        if (!interaction.member.roles.cache.has('1140760173128982588')) {
            // Check if the command is in the cooldown period
            const commandName = interaction.commandName;
            const userId = interaction.user.id;
            const timeout = await commandTimeout.findOne({
                discordId: userId,
                command: commandName
            });

            if (timeout) {
                interaction.reply({
                    content: `This command is on cooldown for you. Please wait until <t:${Math.floor(timeout.expiration / 1000)}:R>. You can also boost the server to bypass this cooldown.`,
                    ephemeral: true
                });
                return;
            }

            // Set a new timeout for the command (3 hours)
            const expiration = Date.now() + 3 * 60 * 60 * 1000; // 3 hours in milliseconds
            const newTimeout = await commandTimeout.create({
                discordId: userId,
                command: commandName,
                expiration: expiration
            });

            await newTimeout.save()
        }

        await interaction.deferReply();

        try {
            const stationCode = interaction.options.getString('station').toUpperCase();
            const track = interaction.options.getString('track') ?? null;
            const content = interaction.options.getString('content') ?? 'departure';
            const layout = interaction.options.getString('layout') ?? 'landscape';
            const notice = interaction.options.getString('notice') ?? 'yes';

            let link;

            if (track === null) {
                link = `https://rtd.banenor.no/web_client/std?station=${stationCode}&layout=${layout}&content=${content}&notice=${notice}`
            } else {
                link = `https://rtd.kv.banenor.no/web_client/std?station=${stationCode}&header=no&content=track&track=${track}`
            };

            try {
                const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreDefaultArgs: ['--disable-extensions'] });
                const page = await browser.newPage()

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
                };

                page.emulateTimezone('Europe/Oslo');

                await page.goto(link);

                await wait(4_000);

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
                    interaction.editReply(link);
                };

                await browser.close();
            } catch (error) {
                console.warn(error);
                interaction.editReply(link);
            }
        } catch (error) {
            console.warn(error)
        }
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
}