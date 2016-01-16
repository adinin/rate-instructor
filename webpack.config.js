'use strict';  
var webpack = require('webpack'),  
path = require('path');

var APP = __dirname + '/app';

module.exports = {
    context: APP,
    entry: {
        app: ['webpack/hot/dev-server', './entry.js']
    },
    output: {
        path: APP,
        filename: "bundle.js"
    },
    devServer: {
        proxy: {
            '/api/france': {
                target: 'http://localhost:3000',
                secure: false,
            }
        }
    },
    plugins: [  
    new webpack.HotModuleReplacementPlugin()
    ]
};
