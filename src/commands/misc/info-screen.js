const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer')
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
        const stationCode = interaction.options.getString('station');
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
        
        interaction.reply(link);
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
}