const counting = require('../../utils/counting.js');

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
};

module.exports = async (message) => {
    if (message.author.bot) {
        return;
    };

    const channelId = message.channelId.toString()

    if (channelId !== '1285519874138837002') {
        return;
    };

    //console.log(message.channelId)

    const text = message.content;

    const loweredText = text.toLowerCase()

    if (loweredText.includes('0x') === true && message.author.id !== '935889950547771512' ) {
        const botReply = await message.channel.send(`<@${message.author.id}> only numbers are allowed here!`);

        await message.delete().catch(e=>{console.warn(e)});

        await sleep(3000)

        botReply.delete().catch(e=>{console.warn(e)});

        return;
    };

    const numberInText = Number(text);

    //console.log(numberInText)

    if (numberInText !== numberInText) {
        if (message.author.id === '935889950547771512') {
            return;
        };

        //console.log('MessageDeleted');

        const botReply = await message.channel.send(`<@${message.author.id}> only numbers are allowed here!`);

        await message.delete().catch(e=>{console.warn(e)});

        await sleep(3000)

        botReply.delete().catch(e=>{console.warn(e)});

        return;
    };

    if (numberInText < 1) {
        if (message.author.id === '935889950547771512') {
            return;
        };

        const botReply = await message.channel.send(`<@${message.author.id}> only numbers above 0 are allowed here!`);
        
        await message.delete().catch(e=>{console.warn(e)});; 
        
        await sleep(3000)

        botReply.delete().catch(e=>{console.warn(e)});
        return;
    }

    let nextNumber = await counting.findById('66e9500b12c20d26f47cdd88').exec();

    if (!nextNumber) {
        nextNumber = new counting({
            _id: '66e9500b12c20d26f47cdd88',
            nextNumber: 1,
            lastNumberSenderId: '0'
        });
    };

    if (numberInText === nextNumber.nextNumber && message.author.id !== nextNumber.lastNumberSenderId) {
        nextNumber.nextNumber = numberInText + 1;
        nextNumber.lastNumberSenderId = message.author.id;
        
        await sleep(1000)

        message.react('✅');
    } else if (message.author.id === nextNumber.lastNumberSenderId) {
        message.channel.send(`<@${message.author.id}> tried to count twice!\nThe count has been restarted.\n**The next number is 1.**`);

        nextNumber.nextNumber = 1;
        nextNumber.lastNumberSenderId = '0';
    } else if (numberInText !== nextNumber.nextNumber) {
        message.channel.send(`<@${message.author.id}>, ${numberInText} was the incorrect number!\nThe correct number was **${nextNumber.nextNumber}**.\nThe count has been restarted.\n**The next number is 1.**`);

        nextNumber.nextNumber = 1;
        nextNumber.lastNumberSenderId = '0';
    };

    await nextNumber.save();
};