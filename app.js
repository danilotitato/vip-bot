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

    switch (message.toLowerCase()) {
        case '!updatevips':
            const vips = await client.vips(channel);
            console.log(vips);
            break;
        default:
            break;
    }
});