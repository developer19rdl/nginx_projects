module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    clearMocks: true,
    collectCoverageFrom: [
        'app/controllers/**/*.js',
        '!app/controllers/*Cron*.js',
        '!app/controllers/*OEE*.js',
        '!app/controllers/*Oee*.js',
        '!app/controllers/*Old.js',
    ],
};
