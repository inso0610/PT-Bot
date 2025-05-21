const staffs = require('../../utils/website/staffs');
const passwordResets = require('../../utils/website/passwordReset');
const { get } = require('mongoose');

module.exports = async (client) => {
    /*try {
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
    }*/

    async function getResets() {
        const allResets = await passwordResets.find({}).exec()

        for (const reset of allResets) {
            const staffDocument = await staffs.findOne({ email: reset.email });
            if (!staffDocument) return;

            const user = await client.users.fetch(staffDocument.discordId).catch(e => {
                console.warn(`Error fetching user ${staffDocument.discordId}: ${e}`);
            });

            if (user) {
                user.send(`You have requested a password reset. Please use the following link to reset your password: https://www.polartracks.no/PasswordReset/${reset.token}`).catch(e => {
                    console.warn(`Error sending password reset link to ${user.username}: ${e}`);
                });
            } else {
                console.warn(`User with ID ${staffDocument.discordId} not found.`);
            }
        };
    };

    getResets();

    setInterval(getResets, 60_00); 
};
