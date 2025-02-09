const countingBlacklist = require('../../utils/countingBlacklist');
const ticketBlacklist = require('../../utils/ticketBlacklist');
const timebans = require('../../utils/moderation/timebans');
const modlogs = require('../../utils/moderation/modlogs');

module.exports = (client) => {
    setInterval(async () => {
        const countingBlacklisted = await countingBlacklist.find({
            expiration: { $lt: Date.now() },
            permanent: false
        }).exec();

        for (const blacklistedUser of countingBlacklisted) {
            if (blacklistedUser.expiration < Date.now() && !blacklistedUser.permanent) {
                await blacklistedUser.deleteOne();
                const user = await client.users.fetch(blacklistedUser.discordId);
                user.send(`Your blacklist from the counting channel has expired.`).catch(e => {
                    console.warn(e);
                });
            };
        };

        const ticketBlacklisted = await ticketBlacklist.find({
            expiration: { $lt: Date.now() },
            permanent: false
        }).exec();

        for (const blacklistedUser of ticketBlacklisted) {
            if (blacklistedUser.expiration < Date.now() && !blacklistedUser.permanent) {
                await blacklistedUser.deleteOne();
                const user = await client.users.fetch(blacklistedUser.discordId);
                user.send(`Your blacklist from the ticket system has expired.`).catch(e => {
                    console.warn(e);
                });
            };
        };

        const timebanned = await timebans.find({
            expiration: { $lt: Date.now() }
        }).exec();

        const guild = client.guilds.cache.get('1089282844657987587');

        for (const bannedUser of timebanned) {
            if (bannedUser.expiration < Date.now()) {
                await bannedUser.deleteOne();

                //Log the unban
                const unbanLog = new modlogs({
                    discordId: bannedUser.discordId,
                    action: 'unban',
                    reason: `Timeban expired (${timebanned.modlogId})`,
                    moderatorId: client.user.id,
                    moderatorUsername: client.user.username
                });

                guild.members.unban(bannedUser.discordId, { reason: `Timeban expired (${timebanned.modlogId})` }).catch(e => {
                    console.warn(e);
                });

                unbanLog.save();
            };
        };
    }, 60000); // 1 minute (60,000 milliseconds)
};
