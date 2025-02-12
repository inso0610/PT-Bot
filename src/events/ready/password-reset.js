const staffs = require('../../utils/website/staffs');
const passwordResets = require('../../utils/website/passwordReset');

module.exports = async (client) => {
    try {
        const changePasswordStream = passwordResets.watch();

        changePasswordStream.on('change', async (change) => {
            if (change.operationType === 'insert') {
                const staffDocument = await staffs.findOne({ email: change.fullDocument.email });

                if (!staffDocument) return;

                const user = await client.users.fetch(staffDocument.discordId);

                user.send(`You have requested a password reset. Please use the following link to reset your password: https://www.polartracks.no/PasswordReset/${change.fullDocument.token}`).catch( e => {
                    console.warn(`Error sending password reset link to ${user.username}: ${e}`);
                });
            };
        });
    } catch (error) {
        console.log(`Error initializing database: ${error}`);
    }
};
