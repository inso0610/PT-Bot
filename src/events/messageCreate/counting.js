const counting = require('../../utils/counting.js');
const countingBlacklist = require('../../utils/countingBlacklist.js');
const { evaluate } = require('mathjs');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = async (message) => {
    if (message.author.bot) {
        return;
    }

    const channelId = message.channelId.toString();

    if (channelId !== '1285519874138837002') {
        return;
    }

    // Check if the user is blacklisted

    const blacklisted = await countingBlacklist.findOne({ discordId: message.author.id }).exec();

    if (blacklisted) {
        await message.delete().catch(e => console.warn(e));
        message.author.send(`Your latest attempt to count was blocked because you are blacklisted from the counting channel for the following reason: ${blacklisted.reason}. This is ${blacklisted.permanent ? 'permanent' : `until <t:${Math.floor(blacklisted.expiration.getTime() / 1000)}:F>`}. 
            You can appeal this blacklist by creating a ticket.`).catch(e => {
                console.warn(e);
            });
        return;
    };

    const text = message.content.trim();

    // Prevent hexadecimal (0x format)
    if (text.toLowerCase().includes('0x') && message.author.id !== '935889950547771512') {
        const botReply = await message.channel.send(`<@${message.author.id}> only numbers and math expressions are allowed here!`);
        await message.delete().catch(e => console.warn(e));
        await sleep(3000);
        botReply.delete().catch(e => console.warn(e));
        return;
    }

    let numberInText;

    try {
        // Evaluate the math expression safely
        numberInText = evaluate(text);
    } catch (error) {
        // If evaluation fails, reject input
        if (message.author.id === '935889950547771512') {
            return;
        }

        const botReply = await message.channel.send(`<@${message.author.id}> invalid mathematical expression!`);
        await message.delete().catch(e => console.warn(e));
        await sleep(3000);
        botReply.delete().catch(e => console.warn(e));
        return;
    }

    // Ensure the result is a valid number
    if (isNaN(numberInText) || !isFinite(numberInText)) {
        if (message.author.id === '935889950547771512') {
            return;
        }

        const botReply = await message.channel.send(`<@${message.author.id}> only valid numbers and expressions are allowed!`);
        await message.delete().catch(e => console.warn(e));
        await sleep(3000);
        botReply.delete().catch(e => console.warn(e));
        return;
    }

    // Ensure number is an integer and above 0
    if (!Number.isInteger(numberInText) || numberInText < 1) {
        if (message.author.id === '935889950547771512') {
            return;
        }

        const botReply = await message.channel.send(`<@${message.author.id}> only whole numbers above 0 are allowed!`);
        await message.delete().catch(e => console.warn(e));
        await sleep(3000);
        botReply.delete().catch(e => console.warn(e));
        return;
    }

    let nextNumber = await counting.findById('66e9500b12c20d26f47cdd88').exec();

    if (!nextNumber) {
        nextNumber = new counting({
            _id: '66e9500b12c20d26f47cdd88',
            nextNumber: 1,
            lastNumberSenderId: '0'
        });
    }

    if (numberInText === nextNumber.nextNumber && message.author.id !== nextNumber.lastNumberSenderId) {
        nextNumber.nextNumber = numberInText + 1;
        nextNumber.lastNumberSenderId = message.author.id;

        await sleep(1000);
        message.react('✅');
    } else if (message.author.id === nextNumber.lastNumberSenderId) {
        message.channel.send(`<@${message.author.id}> tried to count twice!\nThe count has been restarted.\n**The next number is 1.**`);

        nextNumber.nextNumber = 1;
        nextNumber.lastNumberSenderId = '0';
    } else if (numberInText !== nextNumber.nextNumber) {
        message.channel.send(`<@${message.author.id}>, ${numberInText} was the incorrect number!\nThe correct number was **${nextNumber.nextNumber}**.\nThe count has been restarted.\n**The next number is 1.**`);

        nextNumber.nextNumber = 1;
        nextNumber.lastNumberSenderId = '0';
    }

    await nextNumber.save();
};
