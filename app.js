require('dotenv').config();

const tmi = require('tmi.js');

const client = new tmi.Client({
    options: {
        debug: true,
        messagesLogLevel: "info"
    },
    connection: {
        reconnect: true,
        secure: true
    },

    identity: {
        username: `${process.env.TWITCH_USERNAME}`,
        password: `oauth:${process.env.TWITCH_OAUTH_TOKEN}`
    },
    channels: [`${process.env.TWITCH_CHANNEL}`]
});

client.connect().catch(console.error);

client.on('message', async (channel, tags, message, self) => {
    if (self) return;

    const [command, ...messageRemainder] = message.toString().split(' ');
    const arg = messageRemainder.join(' ');

    switch (command.toLowerCase()) {
        case '!pingvipbot':
            if (await isModerator(tags.username.toLowerCase(), channel)) {
                client.say(channel, 'YEP i\'m alive Pog');
            }

            break;
        case '!dcvip':
            if (await isVip(tags.username.toLowerCase(), channel)) {
                if (!isDiscordTagValid(arg)) {
                    client.say(channel, `@${tags.username}, ${arg} is not a valid Discord tag. Please run the command again`);
                    return;
                }

                client.say(channel, `@${tags.username}, you have assigned the username ${arg} to the VIP role in Discord. If you haven't joined it yet, mistyped it or changed the username, please run the command again`);
                // TODO: post the vip user to DB endpoint
            } else {
                client.say(channel, `@${tags.username} sorry, you are not a VIP`);
            }

            break;
        default:
            break;
    }
});

const isModerator = async (username, channel) => {
    const mods = await client.mods(channel);
    return mods.includes(username);
}

const isVip = async (username, channel) => {
    const vips = await client.vips(channel);
    return vips.includes(username);
}

const isDiscordTagValid = tag => {
    const validUserRe = /^[\w-.]{2,32}$/g;
    const invalidUserRe = /[@:#]+|```|^discordtag$|^everyone$|^here$/g;
    const validDiscriminatorRe = /^\d{4}$/g

    const [user, ...remainder] = tag.split("#");
    const discriminator = remainder.join('#');

    if (!user || !discriminator || !validUserRe.test(user)
        || invalidUserRe.test(user) || !validDiscriminatorRe.test(discriminator))
        return false;

    return true;
}
