module.exports = async (message) => {
    if (message.author.bot) {
        return;
    }

    const text = message.content
    const result = text.toLowerCase();
    
    if (!result.slice(-1) === '.') {
        message.reply('Remember period at the end of a sentence')
    }
};