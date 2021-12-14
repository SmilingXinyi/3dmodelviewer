module.exports = {
    // This function will run for each entry/format/env combination
    rollup(config, options) {
        // config.target = 'umd';
        // config.minify = false;
        // config.env = 'production';
        console.log(config)
        console.log('-------------');
        // config.external = null;
        return config; // always return a config.
    },
};
