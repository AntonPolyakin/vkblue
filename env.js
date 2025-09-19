const env = require('dotenv').config({
    path: ['./.env', './.env.local'],
    override: true,
    debug: true,
    processEnv: process.env,
});

module.exports = {...env.parsed, ...process.env };