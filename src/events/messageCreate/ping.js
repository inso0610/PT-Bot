module.exports = (message) => {
    if (message.author.bot) {
        return;
    };

    if (!message.guild) {
        return;
    };

    const channelId = message.channelId;
    const content = message.content;

    if (content.toUpperCase().includes('[PING]') && (message.member.roles.cache.has('1111370796439453777') || message.member.roles.cache.has('1140260309915938866'))) {
        if (channelId === '1246904420495523925' || channelId === '1337095950027456603') { //trainings
            message.reply('^ <@&1140220447535923200>');
        } else if (channelId === '1149803344852959273'){ //event-announcements
            message.reply('^ <@&1149802530507862056>');
        } else if (channelId === '1140363643347816458'){ //shift-announcements
            message.reply('^ <@&1140248514568405044>');
        } else if (channelId === '1142210439065911386') { // RFOTD
            message.reply('^ <@&1142391663910735883>');
        }
    };
};