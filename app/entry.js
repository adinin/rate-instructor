var angular = require('angular');
require('angular-material');
var HomeCtrl = require('./homectrl.js');

var app = angular.module('app', ['ngMaterial']);
app.controller('AboutmeCtrl', HomeCtrl);