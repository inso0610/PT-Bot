module.exports = async (message) => {
    if (message.author.bot) {
        return;
    }

    const text = message.content
    const result = text.toLowerCase();
    let eldrerådet

    if (result.includes('eldrerådet')) {

        eldrerådet = await message.reply('Eldrerådet is the best!')
        // message.reply('People have their own meanings so I wont have a meaning in this. - <@764095520440188978>, 16.09.2023 21:46')

        eldrerådet.react('🧓')
        eldrerådet.react('👴')
        eldrerådet.react('👵')

    } else{

        return;

    } 
};