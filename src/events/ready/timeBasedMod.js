const countingBlacklist = require('../../utils/countingBlacklist');
const ticketBlacklist = require('../../utils/ticketBlacklist');

module.exports = (client) => {
    setInterval(async () => {
        const countingBlacklisted = await countingBlacklist.find({}).exec();

        for (const blacklistedUser of countingBlacklisted) {
            if (blacklistedUser.expiration < Date.now() && !blacklistedUser.permanent) {
                await blacklistedUser.deleteOne();
                const user = await client.users.fetch(blacklistedUser.discordId);
                user.send(`Your blacklist from the counting channel has expired.`).catch(e => {
                    console.warn(e);
                });
            };
        };

        const ticketBlacklisted = await ticketBlacklist.find({}).exec();

        for (const blacklistedUser of ticketBlacklisted) {
            if (blacklistedUser.expiration < Date.now() && !blacklistedUser.permanent) {
                await blacklistedUser.deleteOne();
                const user = await client.users.fetch(blacklistedUser.discordId);
                user.send(`Your blacklist from the ticket system has expired.`).catch(e => {
                    console.warn(e);
                });
            };
        };
    }, 60000); // 1 minute (60,000 milliseconds)
};
