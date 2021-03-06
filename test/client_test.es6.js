'use strict';
var jsdom = require('mocha-jsdom');

describe('Client tests', () => {
  jsdom({skipWindowCheck: true});
  it('should be an object', () => {
    global.client.should.be.an('object');
  });
  it('should have a session property that is an object', () => {
    global.client.session.should.be.an('object');
  });
  it('should have added __osfClient to the window', () => {
    window.__osfClient.should.be.an('object');
  });
  it('__osfClient should have an authHeader property on it', () => {
    window.__osfClient.authHeader.should.be.an('object');
  });
  it('should have a users method', () => {
    global.client.users.should.be.a('function');
  });
  it('should have a nodes method', () => {
    global.client.nodes.should.be.a('function');
  });
  it('should have a files method', () => {
    global.client.files.should.be.a('function');
  });
});
