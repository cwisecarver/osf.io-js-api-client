'use strict';

import Session from './session.es6.js';
import {Node, File, User} from './models.es6.js';

class Client {
  constructor(url, auth) {
    window.__osfClient = window.__osfClient || {};
    this.session = new Session(url, auth);
  }
  _create(pathSegment, params, model) {
    return this.session.post(pathSegment, params, model);
  }
  _get(pathSegment, params, model) {
    return this.session.get(pathSegment, params, model);
  }
  _update(pathSegment, params, model) {
    return this.session.patch(pathSegment, params, model);
  }
  _delete(pathSegment) {
    return this.session.delete(pathSegment);
  }
  clientFactory(pathSegment, model, allowedMethods, listable=true) {
    // listable=false forces an indentifier for get requests
    let methods = {
      create: (params={}) => {
        return this._create.apply(this, [pathSegment, params, model]);
      },
      get: (params={}) => {
        if (typeof this._identifier !== 'undefined') {
          pathSegment = `${pathSegment}${this._identifier}/`;
        } else if (listable !== true) {
          throw Error('Must provide an identifier.');
        }
        return this._get.apply(this, [pathSegment, params, model]);
      },
      update: (params={}) => {
        if (typeof this._identifier === 'undefined') {
          throw Error('Must provide an identifier for update.');
        } else {
          pathSegment = `${pathSegment}${this._identifier}/`;
          params.id = this._identifier;
        }
        return this._update.apply(this, [pathSegment, params, model]);
      },
      delete: (params={}) => {
        if (typeof this._identifier === 'undefined') {
          throw Error('Must provide an identifier for delete.');
        } else {
          pathSegment = `${pathSegment}${this._identifier}/`;
        }
        return this._delete.apply(this, [pathSegment, params]);
      }
    };

    for (var idx in allowedMethods) {
      this[allowedMethods[idx]] = methods[allowedMethods[idx]];
    }

    return this;
  }
  users(identifier) {
    this._identifier = identifier;
    return this.clientFactory('users/', User, ['get', 'update']);
  }
  nodes(identifier) {
    this._identifier = identifier;
    return this.clientFactory('nodes/', Node, ['create','get','update','delete']);
  }
  files(identifier) {
    this._identifier = identifier;
    return this.clientFactory('files/', File, ['create','get','update','delete'], false);
  }
}

export default Client;
