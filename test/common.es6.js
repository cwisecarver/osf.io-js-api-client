'use strict';

global.should = require('chai').should();
global.expect = require('chai').expect;
global._ = require('lodash');
global.sinon = require('sinon');

// global.OSFClient = require('../client.es6.js').OSFClient;

import OSFClient from '../client.es6.js';

let auth = {username: 'mocha@osf.io', password: 'password'};
global.user_id = 'rgmay';

global.window = {};
global.window.__osfClient = {};
global.window.btoa = function(str) {return new Buffer(str).toString('base64');};

global.client = new OSFClient('http://localhost:8000/v2/', auth);

sinon.stub(global.client.session, 'captureError', (errorString) => { return; });
