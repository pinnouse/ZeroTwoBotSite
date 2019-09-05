'use strict';

const express = require('express');
const fs = require('fs');
const request = require('request');
const crypto = require('crypto');

const config = require('./config.json');

const PORT = config.port || 8080;

// Request variables
var intv;
var clientData;
var totalUsers = 0;
const POST_DATA = {
    key: crypto.createHash('md5').update(config.key).digest('hex')
};

// Server variabless
var app = express();

app.engine('html', (filePath, options, callback) => {
    fs.readFile(filePath, (err, content) => {
        if (err) return callback(err);

        let rendered = content.toString();

        Object.entries(options).filter(([key, _]) => {
            return !["settings", "_locals", "cache"].includes(key);
        }).forEach(([key, value]) => {
            rendered = rendered.replace(`#${key}#`, value);
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

app.listen(PORT, () => {
    updateInformation();
    intv = setInterval(updateInformation, 300000);
    console.log(`Listening on port: ${PORT}`);
});

function updateInformation() {
    request.post(`${config.botServer.url}:${config.botServer.port}`, {
        form: { key: crypto.createHash('md5').update(config.key).digest('hex') }
    }, (error, res, body) => {
        if (error) {
            console.error(error);
            console.log("Failed to connect");
            return;
        }

        if (res.statusCode === 200 && body) {
            var now = new Date();
            // console.log(`Updated data at: ${now.toUTCString()}`);
            clientData = JSON.parse(body);
            totalUsers = 0;
            if (clientData != undefined)
                clientData.guilds.forEach(([_, gld]) => { totalUsers += gld.memberCount });
        }
    });
}

function getTemplates() {
    return {
        client: `<script>
            var guilds = ${clientData.guilds.length || 0};
            var users = ${totalUsers};
            var avatar = "${clientData.avatar}";
            var tag = "${clientData.tag}";
            var commands = new Map(${JSON.stringify(clientData.commands) || "[]"});
            var prefix = "${clientData.prefix}";
        </script>`,
        avatarUrl: clientData.avatar
    }
}