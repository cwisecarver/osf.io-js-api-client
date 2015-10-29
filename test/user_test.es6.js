'use strict';
var jsdom = require('mocha-jsdom');

describe('Test users', () => {
  jsdom({skipWindowCheck: true});

  describe('Get some users', () => {
    before(done => {
      global.client.users().get()
        .then(resp => {
          global.usersResponse = resp;
        })
        .then(done)
        .catch(done);
    });
    it('should have users', () => {
      _.each(global.usersResponse.data, (user) => {
        user.type.should.equal('users');
        user.id.length.should.equal(5);
      });
    });
  });

  describe('Get my user by "me"', () => {
    before(done => {
      global.client.users('me').get()
        .then(resp => {
          global.userByMe = resp;
        })
        .then(done)
        .catch(done);
    });
    it('should have my user id', () => {
      global.userByMe.data.id.should.equal(global.user_id);
    });
  });
  describe('Get my user by "id"', () => {
    before(done => {
      global.client.users(global.user_id).get()
        .then(resp => {
          global.userById = resp;
        })
        .then(done)
        .catch(done);
    });
    it('should equal my user got by "me"', () => {
      global.userById.data.type.should.equal(global.userByMe.data.type);
      global.userById.data.id.should.equal(global.userByMe.data.id);
      global.userById.data.links.self.should.equal(global.userByMe.data.links.self);
      global.userById.data.attributes.full_name.should.equal(global.userByMe.data.attributes.full_name);
      global.userById.data.attributes.date_registered.should.equal(global.userByMe.data.attributes.date_registered);
    });
  });
  describe('Edit user by id', () => {
    before(done => {
      global.client.users(global.user_id)
        .update({
          full_name: global.userById.data.attributes.full_name.split('').reverse().join('')
        })
        .then(resp => {
          global.updatedUser = resp;
        })
        .then(done)
        .catch(done);
    });
    it('should have reversed their full_name', () => {
      global.updatedUser.data.attributes.full_name.should.equal(global.userById.data.attributes.full_name.split('').reverse().join(''));
    });
  });
});
