module.exports = (client) => {
    const d = new Date()
    const date = d.toLocaleDateString()

    const gamersimen = new Date('2024-02-02')
    const gamersimenString = gamersimen.toLocaleDateString()

    if (date === gamersimenString) {
        console.log('Test')
    }
}