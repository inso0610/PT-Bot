const modlogs = require('../../utils/moderation/modlogs.js');
const warnings = require('../../utils/moderation/warnings.js');
const timebans = require('../../utils/moderation/timebans.js');

const executions = {
    ['1188153868144611348']: {

    },
    ['1188154126798962689']: {

    },
    ['1188154211687485460']: {

    },
    ['1272249082512937010']: {

    }
};

const idActions = {
    ['1188153868144611348']: {
        runs: {
            1: {
                action: 'verbal',
                message: 'Please avoid pinging more than 5 members or roles at the same time.'
            },
            2: {
                action: 'timeout',
                duration: 60000, // 1 minute
                reason: 'Pinging more than 5 members or roles at the same time',
                warn: false
            },
            3: {
                action: 'timeout',
                duration: 3600000, // 1 hour
                reason: 'Pinging more than 5 members or roles at the same time',
                warn: true
            },
            4: {
                action: 'timeout',
                duration: 10800000, // 3 hour
                reason: 'Pinging more than 5 members or roles at the same time',
                warn: true
            },
        }
    },
    ['1188154126798962689']: {
        runs: {
            1: {
                action: 'verbal',
                message: 'One of your messages was marked as spam by our automated system. Please avoid sending the same message multiple times.'
            },
            2: {
                action: 'timeout',
                duration: 300000, // 5 minutes
                reason: 'Spamming',
                warn: true
            },
            3: {
                action: 'ban',
                duration: 24, // 24 hours
                reason: 'Spamming',
                appeals: true,
                deleteMessages: false
            }
        }
    },
    ['1188154211687485460']: {
        runs: {
            1: {
                action: 'ban', // Permanent ban
                reason: 'One of your messages was marked as NSFW by our automated system. This ban was done automatically. Please contact server staff if you believe this was a mistake.',
                appeals: true,
                deleteMessages: false
            }
        }
    },
    ['1272249082512937010']: {
        runs: {
            1: {
                action: 'timeout',
                duration: 10800000, // 3 hours
                reason: 'Please refrain from using racist language. This timeout was done automatically please create a ticket if this was a mistake.',
                warn: false,
            }
        }
    }
};

module.exports = async (execution, client) => {
    if (execution.action.type !== 2) return;

    if (!execution.ruleId in idActions) return;

    if (!execution.ruleId in executions) return;

    if (execution.user.id in executions[execution.ruleId]) {
        executions[execution.ruleId][execution.user.id].executions += 1;
        executions[execution.ruleId][execution.user.id].last = Date.now();
    } else {
        executions[execution.ruleId][execution.user.id] = {
            executions: 1,
            last: Date.now()
        };
    };

    const run = idActions[execution.ruleId].runs[executions[execution.ruleId][execution.user.id].executions];

    if (!run) return;

    if (run.action === 'verbal') {
        execution.user.send(run.message).catch(e => {  
            console.warn(e);
        });
    } else if (run.action === 'warn') {
        // Log the warning using mongodb
        const warning = new warnings({
            discordId: execution.user.id,
            reason: `Automod warning (${execution.ruleId}): ` + run.reason,
            moderatorId: client.user.id,
            moderatorUsername: client.user.username
        });

        warning.save();

        const warnLog = new modlogs({
            discordId: execution.user.id,
            action: 'warn',
            reason: `Automod warning (${execution.ruleId}): ` + run.reason,
            moderatorId: client.user.id,
            moderatorUsername: client.user.username
        });

        warnLog.save();

        // Message the user
        execution.user.send(`**⚠️You have been warned in the Polar Tracks Discord server.**\nReason: \`${run.reason}.\``).catch(() => {
            console.warn(e);
        });

    } else if (run.action === 'timeout') {
        execution.member.timeout(run.duration, run.reason).catch(e => {
            console.warn(e);
        });

        // Message the user
        execution.user.send(`**⚠️You have been given a timeout in the Polar Tracks Discord server.**\nReason: \`${run.reason}\`.\n${run.warn ? '\n**A warning was also applied.**' : ''}`).catch(() => {
            console.warn(e);
        });

        // Log the action using mongodb
        const modlog = new modlogs({
            discordId: execution.user.id,
            action: 'timeout',
            reason: `Automod timeout (${execution.ruleId}): ` + run.reason,
            moderatorId: client.user.id,
            moderatorUsername: client.user.username
        });

        modlog.save();

        // Warn the user
        if (run.warn) {
            const warning = new warnings({
                discordId: execution.member.id,
                reason: `Automod warning (${execution.ruleId}): ` + run.reason,
                moderatorId: client.user.id,
                moderatorUsername: client.user.username
            });

            warning.save();

            const warnLog = new modlogs({
                discordId: execution.member.id,
                action: 'warn',
                reason: `This warning was applied together with a timeout (${modlog._id.toString()}): ` + run.reason,
                moderatorId: client.user.id,
                moderatorUsername: client.user.username
            });

            warnLog.save();
        };

        if (run.duration > 10800000) {
            delete executions[execution.ruleId][execution.user.id];
        };
    } else if (run.action === 'kick') {
        // Message the user
        await execution.user.send(`**⚠️You have been kicked from the Polar Tracks Discord server.\nReason: ${run.reason}.\nYou can rejoin the server here: https://discord.gg/m7gxUKm2z6.${run.warn ? '\n**A warning was also applied.**' : ''}`).catch(() => {
            console.warn(e);
        });

        // Kick the user
        await execution.member.kick(run.reason).catch(() => {
            console.warn(e);
        });

        // Log the action using mongodb
        const modlog = new modlogs({
            discordId: execution.user.id,
            action: 'kick',
            reason: `Automod kick (${execution.ruleId}): ` + run.reason,
            moderatorId: client.user.id,
            moderatorUsername: client.user.username
        });

        modlog.save();

        // Warn the user
        if (run.warn) {
            const warning = new warnings({
                discordId: execution.user.id,
                reason: `Automod warning (${execution.ruleId}): ` + run.reason,
                moderatorId: client.user.id,
                moderatorUsername: client.user.username
            });

            warning.save();

            const warnLog = new modlogs({
                discordId: execution.user.id,
                action: 'warn',
                reason: `This warning was applied together with a kick (${modlog._id.toString()}): ` + run.reason,
                moderatorId: client.user.id,
                moderatorUsername: client.user.username
            });

            warnLog.save();
        };
    } else if (run.action === 'ban') {
        // calculate expiration date from hours
        let expiration;

        if (run.duration) {
            expiration = new Date(Date.now() + run.duration * 60 * 60 * 1000);
        };

        // Message the user
        await execution.user.send(`**⚠️You have been banned from the Polar Tracks Discord server.**\nReason: ${run.reason}.\n${run.duration ? `This ban will last until <t:${Math.floor(expiration.getTime() / 1000)}:F>.` : 'This ban is permanent.'}\n${run.appeals ? 'You can appeal the ban here: https://appeals.polartracks.no/' : 'This ban is not appealable.'}`).catch(() => {
            console.warn(e);
        });

        // Ban the user
        if (run.deleteMessages) {
            await execution.member.ban({ deleteMessageSeconds: 60 * 60 * 24 * 7, reason: run.reason }).catch(() => {
                console.warn(e);
            });
        } else {
            await execution.member.ban({ reason: run.reason }).catch(() => {
                console.warn(e);
            });
        };

        // Log the action using mongodb temp ban logged in hours
        const modlog = new modlogs({
            discordId: execution.user.id,
            action: `ban ${run.duration ? ` (temp, ${run.duration} hour(s))` : ''}${run.deleteMessages ? ' (with message deletion)' : ''}${run.appeals ? ' (appealable)' : ''}`,
            reason: `Automod ban (${execution.ruleId}): ` + run.reason,
            moderatorId: client.user.id,
            moderatorUsername: client.user.username
        });
        
        modlog.save();

        if (run.duration) {
            const timeBan = new timebans({
                discordId: execution.user.id,
                modlogId: modlog._id.toString(),
                expiration
            });

            await timeBan.save();
        };

        // Remove from executions
        delete executions[execution.ruleId][execution.user.id];
    } else {
        return;
    };

    const alertSystemMessage = await client.channels.cache.get('1188153939758166129').messages.fetch(execution.alertSystemMessageId);

    alertSystemMessage.reply({
        content: `Action executed for <@${execution.user.id}>: ${run.action} ${run.duration ? `(${run.duration}) ` : ''}${run.deleteMessages ? '(with message deletion) ' : ''}${run.appeals ? '(appealable) ' : ''}${run.warn ? '(with warning) ' : ''}`
    });
};

// Delete executions for people that last did something over three hours ago
setInterval(() => {
    for (const ruleId in executions) {
        for (const userId in executions[ruleId]) {
            if (Date.now() - executions[ruleId][userId].last > 10800000) {
                delete executions[ruleId][userId];
            };
        };
    };
}, 60000);