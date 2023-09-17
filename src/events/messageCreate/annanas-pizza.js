module.exports = (message) => {
    if (message.author.bot) {
        return;
    }

    if (message.content.includes('pineapple')) {

        if (message.content.includes('pizza')) {

            message.reply('Pineapple on pizza is the best!')
            // message.reply('People have their own meanings so I wont have a meaning in this. - <@764095520440188978>, 16.09.2023 21:46')

        } else{

            return;

        }
    } 
};