const countingBlacklist = require('../../utils/countingBlacklist');

module.exports = (client) => {
    setInterval(async () => {
        const blacklisted = await countingBlacklist.find({}).exec();

        for (const blacklistedUser of blacklisted) {
            if (blacklistedUser.expiration < Date.now() && !blacklistedUser.permanent) {
                await blacklistedUser.deleteOne();
                const user = await client.users.fetch(blacklistedUser.discordId);
                user.send(`Your blacklist from the counting channel has expired.`).catch(e => {
                    console.warn(e);
                });
            };
        };
    }, 60000); // 1 minute (60,000 milliseconds)
};
