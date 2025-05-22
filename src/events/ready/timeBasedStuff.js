const ticketBlacklist = require('../../utils/ticketBlacklist');
const timebans = require('../../utils/moderation/timebans');
const modlogs = require('../../utils/moderation/modlogs');
//const commandTimeout = require('../../utils/commandTimeout');

module.exports = (client) => {
    new CronJob('0 * * * * *', async function () {
        const now = new Date(); // Cache time for consistency

        // --- Ticket Blacklist Cleanup ---
        const ticketBlacklisted = await ticketBlacklist.find({
            expiration: { $lt: now },
            permanent: false
        }).exec();

        for (const blacklistedUser of ticketBlacklisted) {
            await blacklistedUser.deleteOne();
            try {
                const user = await client.users.fetch(blacklistedUser.discordId);
                await user.send(`Your blacklist from the ticket system has expired.`);
            } catch (e) {
                console.warn(`Failed to send DM to ${blacklistedUser.discordId}:`, e);
            }
        }

        // --- Timebans Cleanup ---
        const timebanned = await timebans.find({
            expiration: { $lt: now }
        }).exec();

        const guild = client.guilds.cache.get('1089282844657987587');
        if (!guild) return console.warn('Guild not found: 1089282844657987587');

        for (const bannedUser of timebanned) {
            const unbanLog = new modlogs({
                discordId: bannedUser.discordId,
                action: 'unban',
                reason: `Timeban expired (${bannedUser.modlogId})`,
                moderatorId: client.user.id,
                moderatorUsername: client.user.username
            });

            try {
                await guild.members.unban(bannedUser.discordId, {
                    reason: `Timeban expired (${bannedUser.modlogId})`
                });
                await bannedUser.deleteOne();
                await unbanLog.save();
            } catch (e) {
                console.warn(`Failed to unban ${bannedUser.discordId}:`, e);
            }
        }

        /* --- Command Timeout Cleanup ---
        await commandTimeout.deleteMany({
            expiration: { $lt: now }
        }).exec(); Uses TTL now*/ 
    }, null, true, 'Europe/Oslo', null, false);
};
