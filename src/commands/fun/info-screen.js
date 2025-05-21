const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const wait = require('node:timers/promises').setTimeout;

const images = './src/utils/images';
//const stationCodes = require('../../utils/trainings.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('info-screen')
    .setDescription('Get a station information screen or Real Time Display.')
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
                { name: 'Arrivals', value: 'arrival'}
            ))
    .addStringOption((option) => 
        option
            .setName('layout')
            .setDescription('Should the screen be in landscape or portrait mode? (Does not do anything with track is specified)')
            .setRequired(false)
            .addChoices(
                { name: 'Landscape', value: 'landscape' },
                { name: 'Portrait', value: 'portrait'}
            ))
    .addStringOption((option) => 
        option
            .setName('notice')
            .setDescription('Should station notices show up? (Does not do anything with track specified)')
            .setRequired(false)
            .addChoices(
                { name: 'Yes', value: 'yes' },
                { name: 'No', value: 'no'}
            )),

    run: async ({ interaction, client, handler }) => {
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
                const browser = await puppeteer.launch()
                const page = await browser.newPage()
        
                if (layout === 'landscape' || track !== null ) {
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
        
                await page.goto(link);
        
                await wait(4_000);
        
                await page.screenshot({ path: `${images}/screen.png` });
        
                if (fs.existsSync(`${images}/screen.png`)) {
                    console.log("Screenshot saved");
                    
                    await interaction.editReply({
                        content: link,
                        files: [{ attachment: `${images}/screen.png` }]
                    });
        
                    fs.unlinkSync(`${images}/screen.png`)
                } else {
                    console.log("Screenshot not saved");
                    interaction.editReply(link);
                };
        
                await browser.close();
            } catch (error) {
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