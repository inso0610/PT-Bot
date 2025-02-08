const heartBeatLink = 'https://uptime.betterstack.com/api/v1/heartbeat/MRLRdq1XhM5B98LpML7farCk';

async function sendHeartBeat() {
    try {
        const response = await fetch(heartBeatLink);
        if (!response.ok) {
            console.warn(`Heartbeat failed: ${response.status} ${response.statusText}`);
        };
    } catch (error) {
        console.error(`Error sending heartbeat: ${error.message}`);
    };
};

sendHeartBeat();

module.exports = (client) => {
    setInterval(() => {
        sendHeartBeat();
    }, 300000); // 5 minutes (300,000 milliseconds)
};