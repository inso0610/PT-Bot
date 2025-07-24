const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { searchAll, getJourney } = require('../../utils/entur');
const { formatDuration, formatTime } = require('../../utils/formatters');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('plan-journey')
        .setDescription('Plan a journey between two locations using Entur')
        .addStringOption(option =>
            option.setName('from')
                .setDescription('Where are you starting from?')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('to')
                .setDescription('Where are you going?')
                .setRequired(true)
                .setAutocomplete(true)),

    run: async ({ interaction }) => {
        const fromId = interaction.options.getString('from');
        const toId = interaction.options.getString('to');

        await interaction.deferReply();

        const trips = await getJourney(fromId, toId);

        if (!trips || trips.length === 0) {
            return interaction.editReply('No journey options found.');
        }

        const embed = new EmbedBuilder()
            .setTitle('Journey Options')
            .setDescription(`Top 5 results from <${fromId}> to <${toId}>:`)
            .setColor(0x0099FF)
            .setFooter({ text: 'Powered by Entur' });

        trips.slice(0, 5).forEach((trip, index) => {
            const startTime = formatTime(trip.aimedStartTime);
            const endTime = formatTime(trip.aimedEndTime);
            const duration = formatDuration(trip.duration);
            const walk = formatDuration(trip.walkTime);
            const wait = formatDuration(trip.waitingTime);

            embed.addFields({
                name: `Option ${index + 1}`,
                value: `**Start:** ${startTime}  →  **End:** ${endTime}\n` +
                       `**Duration:** ${duration} | **Walk:** ${walk} | **Wait:** ${wait}`
            });
        });

        interaction.editReply({ embeds: [embed] });
    },

    autocomplete: async ({ interaction }) => {
        const focusedValue = interaction.options.getFocused();
        const stations = await searchAll(focusedValue);

        const choices = (stations ?? []).map(station => ({
            name: station.properties.name,
            value: station.properties.id,
        }));

        return interaction.respond(choices.slice(0, 25));
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};
