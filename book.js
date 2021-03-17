var pkg = require('./package.json');

module.exports = {
    // Documentation for Nuts is stored under "docs"
    root: './docs',
    title: 'Nuts Documentation',

    // Enforce use of GitBook v3
    gitbook: '>=3.0.0-pre.0',

    // Use the "official" theme
    plugins: ['theme-official', 'sitemap'],
    theme: 'official',

    variables: {
        version: pkg.version
    },

    pluginsConfig: {
        sitemap: {
            hostname: 'https://nuts.gitbook.com'
        }
    }
};
