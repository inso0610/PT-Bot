module.exports = (message) => {
    if (message.author.bot) {
        return;
    };

    console.log(message.channelId)

    if (message.channelId !== '1285519874138837002') {
        return;
    };

    const counting = require('../../utils/counting.js');

    const text = message.content;

    let numberInText = Number(text);

    if (numberInText === NaN) {
        message.delete();

        message.channel.send(`<@${message.author.id}> only numbers are allowed here!`);
        return;
    };

    const nextNumber = counting.findOne();

    if (numberInText === nextNumber.Number && message.author.id !== nextNumber.lastNumberSenderId) {
        nextNumber.Number = numberInText + 1;
        nextNumber.lastNumberSenderId = message.author.id;
    } else if (message.author.id === nextNumber.lastNumberSenderId) {
        nextNumber.Number = 1;
        nextNumber.lastNumberSenderId = '0';

        message.channel.send(`<@${message.author.id}> tried to count twice!\nThe count has been restarted.\n**The next number is 1.**`)
    } else if (numberInText === nextNumber.Number) {
        nextNumber.Number = 1;
        nextNumber.lastNumberSenderId = '0';

        message.channel.send(`<@${message.author.id}> tried to count twice!\nThe count has been restarted.\n**The next number is 1.**`)
    };
};