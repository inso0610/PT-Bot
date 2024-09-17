const counting = require('../../utils/counting.js');

module.exports = async (message) => {
    if (message.author.bot) {
        return;
    };

    const channelId = message.channelId

    if (channelId !== '1285519874138837002') {
        return;
    };

    console.log(message.channelId)

    const text = message.content;

    const numberInText = Number(text);

    //console.log(numberInText)

    if (numberInText !== numberInText) {
        //console.log('MessageDeleted');

        message.channel.send(`<@${message.author.id}> only numbers are allowed here!`);

        await message.delete();
        return;
    };

    const nextNumber = await counting.findById('66e9500b12c20d26f47cdd88').exec();

    console.log(nextNumber)

    if (numberInText === nextNumber.nextNumber && message.author.id !== nextNumber.lastNumberSenderId) {
        nextNumber.nextNumber = numberInText + 1;
        nextNumber.lastNumberSenderId = message.author.id;
    } else if (message.author.id === nextNumber.lastNumberSenderId) {
        nextNumber.nextNumber = 1;
        nextNumber.lastNumberSenderId = '0';

        message.channel.send(`<@${message.author.id}> tried to count twice!\nThe count has been restarted.\n**The next number is 1.**`)
    } else if (numberInText === nextNumber.nextNumber) {
        nextNumber.nextNumber = 1;
        nextNumber.lastNumberSenderId = '0';

        message.channel.send(`<@${message.author.id}> tried to count twice!\nThe count has been restarted.\n**The next number is 1.**`)
    };

    await nextNumber.save();
};