const counting = require('../../utils/counting.js');
const countingBlacklist = require('../../utils/countingBlacklist.js');

module.exports = async (oldMessage, newMessage) => {
    if (oldMessage.author.bot) {
        return;
    };

    // Return if the user is blacklisted from counting
    const blacklisted = await countingBlacklist.findOne({ discordId: oldMessage.author.id }).exec();
    
        if (blacklisted) {
            return;
        };

    const channelId = oldMessage.channelId.toString()

    if (channelId !== '1285519874138837002') {
        return;
    };

    if (newMessage.author.id === '935889950547771512') {
        return;
    };

    let nextNumber = await counting.findById('66e9500b12c20d26f47cdd88').exec();

    if (oldMessage.content === newMessage.content) {
        return;
    };

    if (!nextNumber) {
        nextNumber = new counting({
            _id: '66e9500b12c20d26f47cdd88',
            nextNumber: 1,
            lastNumberSenderId: '0'
        });
    };

    newMessage.channel.send(`<@${newMessage.author.id}> Edited their message!\nThe count has been restarted.\n**The next number is 1.**`);

    nextNumber.nextNumber = 1;
    nextNumber.lastNumberSenderId = '0';

    await nextNumber.save();
};