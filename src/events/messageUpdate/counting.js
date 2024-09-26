const counting = require('../../utils/counting.js');

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
};

module.exports = async (oldMessage, newMessage) => {
    if (oldMessage.author.bot) {
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

    if (oldMessage === newMessage) {
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