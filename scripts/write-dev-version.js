const fs = require('fs')
const packJson = require('../package.json')
const version = packJson.version
fs.writeFileSync('./src/build-info.json', JSON.stringify({ version: `${version}-dev` }))
