import tracer from 'tracer';

const logLevel = process.env.LOGLEVEL || 'trace';

const logger = tracer.colorConsole({
    format: ['{{timestamp}} <{{title}}> {{file}}:{{line}} : {{message}}'],
    preprocess: function (data) {
        data.title = data.title.toUpperCase()
    },
    dateformat: 'isoUtcDateTime',
    level: logLevel
})

export default logger;