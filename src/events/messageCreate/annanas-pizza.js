module.exports = async (message) => {
    if (message.author.bot) {
        return;
    }

    let pineapple

    if (message.content.includes('pineapple')) {

        if (message.content.includes('pizza')) {

            pineapple = await message.reply('Pineapple on pizza is the best!')
            // message.reply('People have their own meanings so I wont have a meaning in this. - <@764095520440188978>, 16.09.2023 21:46')

            pineapple.react('🍍')
            pineapple.react('🍕')

        } else{

            return;

        }
    } 
};