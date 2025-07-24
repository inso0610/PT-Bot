const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { searchAll, getJourney } = require('../../utils/entur');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('plan-journey')
        .setDescription('Plan a journey between two places using Entur')
        .setContexts(['Guild'])
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

        const journeys = await getJourney(fromId, toId);

        if (!journeys || journeys.length === 0) {
            return interaction.editReply("🚫 Could not find any journey between the selected places.");
        }

        const embeds = journeys.slice(0, 5).map((trip, i) => {
            const embed = new EmbedBuilder()
                .setColor(0x2E9AFE)
                .setTitle(`Journey Option ${i + 1}`)
                .setDescription(`**🕐 Departure:** <t:${Math.floor(trip.startTime / 1000)}:t>\n**🏁 Arrival:** <t:${Math.floor(trip.endTime / 1000)}:t>\n**⏱️ Duration:** ${Math.floor(trip.duration / 60)} minutes`)
                .setFooter({ text: 'Data provided by Entur' });

            for (const leg of trip.legs) {
                const line = leg.line?.publicCode || leg.line?.name || 'unknown line';
                const mode = leg.mode.toUpperCase();
                const fromTime = `<t:${Math.floor(new Date(leg.fromPlace.departureTime).getTime() / 1000)}:t>`;
                const toTime = `<t:${Math.floor(new Date(leg.toPlace.arrivalTime).getTime() / 1000)}:t>`;

                embed.addFields({
                    name: `🚍 ${mode} ${line}`,
                    value: `**From:** ${leg.fromPlace.name} ${fromTime}\n**To:** ${leg.toPlace.name} ${toTime}`,
                    inline: false
                });
            }

            return embed;
        });

        return interaction.editReply({ embeds });
    },

    autocomplete: async ({ interaction }) => {
        const focusedValue = interaction.options.getFocused();
        const stations = await searchAll(focusedValue);

        if (!stations || stations.length === 0) {
            return interaction.respond([]);
        }

        const choices = stations.map(station => ({
            name: station.properties.name,
            value: station.properties.id
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
