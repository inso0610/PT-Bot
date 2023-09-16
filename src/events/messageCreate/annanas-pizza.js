module.exports = (message) => {
    if (message.author.bot) {
        return;
    }

    if (message.content.includes('pineapple')) {

        if (message.content.includes('pizza')) {

            message.reply('Pineapple on pizza is the best!')

        } else{

            return;

        }
    } 
};