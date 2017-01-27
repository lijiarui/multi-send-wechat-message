const winston = require('winston');
const path = require('path');
const fs = require('fs');

winston.level = 'debug';
winston.exitOnError = false;

function getUTC(date) {
    return new Date(date.getTime());
}

// TODO here should consider in docker
if (!fs.existsSync('../../var')) {
    fs.mkdirSync('../../var');
}

winston.configure({
    transports: [
        new (winston.transports.File)({
            name: 'error-file',
            filename: path.resolve(__dirname, '../../var/error.log'),
            level: 'error',
            timestamp: function () {
                return getUTC(new Date())
            }
        }),
        new (winston.transports.File)({
            name: 'info-file',
            filename: path.resolve(__dirname, '../../var/info.log'),
            level: 'info',
            timestamp: function () {
                return getUTC(new Date())
            }
        }),
        new (winston.transports.Console)({level: 'verbose'})
    ]
});

export default winston;
