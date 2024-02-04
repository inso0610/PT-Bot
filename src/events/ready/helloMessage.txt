module.exports = (client) => {
    const randomChat = client.channels.cache.get('1189740423741190226');
    const d = new Date()

    const year = d.getFullYear()

    const month = d.getMonth()
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = months[month]

    const date = d.getDate()

    const day = d.getDay()
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[day]

    const hour = d.getHours()

    const minute = d.getMinutes()

    randomChat.send(`**Hello!👋** *PT Assistance went online ${dayName} ${date} ${monthName} ${year} ${hour}:${minute}*`)
}