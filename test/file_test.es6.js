'use strict';
var jsdom = require('mocha-jsdom');
var _ = require('lodash');

describe('Files ...', () => {
  jsdom({skipWindowCheck: true});
  describe('Get some files', () => {
    before(done => {
      try {
        global.client.files().get().then(resp => {
          global.filesResponse = resp;
        }).then(done).catch(done);
      } catch (e) {
        global.filesResponse = e;
        done();
      }
    });
    it('should get a missing identifier error', () => {
      global.filesResponse.name.should.equal(new Error('Must provide an identifier.').name);
      global.filesResponse.message.should.equal(new Error('Must provide an identifier.').message);
    });
  });
});
