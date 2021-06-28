'use strict';

const express = require('express');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

const config = require('./config.json');

const PORT = process.env.PORT || config.port || 3000;

// Request variables
var intv;
var clientData = {};
var totalUsers = 0;
const AUTH_KEY = crypto.createHash('md5').update(config.key).digest('hex');

// Server variabless
var app = express();

app.engine('html', (filePath, options, callback) => {
    fs.readFile(filePath, (err, content) => {
        if (err) return callback(err);

        let rendered = content.toString();

        Object.entries(options).filter(([key, _]) => {
            return !["settings", "_locals", "cache"].includes(key);
        }).forEach(([key, value]) => {
            let re = new RegExp(`#${key}#`, "g");
            rendered = rendered.replace(re, value);
        });

        return callback(null, rendered);
    });
});

app.set('views', './views');
app.set('view engine', 'html');

app.use('/static', express.static('views/static'));

app.get('/', (req, res) => {
    res.render('index', getTemplates());
});

app.get('/commands', (req, res) => {
    res.render('commands', getTemplates());
});

app.get('/donation-thanks', (req, res) => {
    res.render('donation-thanks', getTemplates());
});

app.get('/.well-known/cf-2fa-verify.txt', (req, res) => {
    res.send('7ecabbc5d41c7cb');
});

updateInformation().then(() => {
    intv = setInterval(updateInformation, 300000);
    app.listen(PORT, () => {
        console.log(`Listening on port: ${PORT}`);
    });
}).catch(console.error);

async function updateInformation() {
    const params = new URLSearchParams();
    params.append('key', AUTH_KEY);
    try {
        const { status, data } = await axios.post(`${config.botServer.url}:${config.botServer.port}`, params);
        if (status !== 200) return;
        clientData = data;
        totalUsers = 0;
        clientData.guilds.forEach(([_, gld]) => { totalUsers += gld.memberCount });
    } catch(e) {
        if (e.response) {
            console.error(`Axios error: (${e.response.status}) ${e.response.data}`);
        } else {
            console.error(e);
        }
    }
}

function getTemplates() {
    return {
        client: `<script>
            var guilds = ${clientData.guilds ? clientData.guilds.length || 0 : 0};
            var users = ${totalUsers};
            var avatar = "${clientData.avatar}";
            var tag = "${clientData.tag}";
            var commands = new Map(${JSON.stringify(clientData.commands) || "[]"});
            var prefix = "${clientData.prefix}";
        </script>`,
        avatarUrl: clientData.avatar
    }
}