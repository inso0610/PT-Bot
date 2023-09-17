module.exports = async (message) => {
    if (message.author.bot) {
        return;
    }

    const text = message.content
    const result = text.toLowerCase();
    let ungdomsrådet

    if (result.includes('ungdomsrådet')) {

        ungdomsrådet = await message.reply('Ungdomsrådet is the worst! 🤮')
        // message.reply('People have their own meanings so I wont have a meaning in this. - <@764095520440188978>, 16.09.2023 21:46')

        ungdomsrådet.react('🤮')

    } else{

        return;

    } 
};