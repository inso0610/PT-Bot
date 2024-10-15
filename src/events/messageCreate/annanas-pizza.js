module.exports = async (message) => {
    if (message.author.bot) {
        return;
    }

    const text = message.content
    const result = text.toLowerCase();
    let pineapple

    
    if (result.includes('pineapple')) {
    
        if (result.includes('pizza')) {
    
            pineapple = await message.reply('Pineapple on pizza is the best!')
    
            pineapple.react('🍍')
            pineapple.react('🍕')
    
        } else{
    
            return;
    
        }
    }
};