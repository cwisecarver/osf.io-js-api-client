'use strict';

import URI from 'URIjs';
import OSFClient from './client.es6.js';
import apiExtend from './apiExtend.es6.js';

class BaseModel {
  constructor(params={}) {
    this._fields = {
      'type': null,
      'attributes': null
    };

    if (!('attributes' in params)) {
      params = {attributes: params};
    }

    this._apiExtend = apiExtend;
    this._params = params;
    this._is_valid = null;
    this.relationships = {};
    this.magicRelationships = {};
  }
  _add_relationship(relationship, url) {
    // add a client that can extrapolate the model from response.data.type to
    // this.relationships using a key of relationship
    if (url === null) {
      return {};
    }
    let uri = new URI(url);
    var pathSegment = uri.path();
    let modelLookup = {
      // relationshipKeyName: [Model, [allowed, methods]],
      'children': [Node, ['create', 'get', 'update', 'delete']],
      'nodes': [Node, ['create', 'get', 'update', 'delete']],
      'contributors': [User, ['get', 'update']],
      'files': [File, ['create', 'get', 'update', 'delete']],
      'versions': [File, ['get']],
      'checkout': [BaseModel, ['get', 'update']],
      'node_links': [Node, ['create', 'get', 'update', 'delete']],
      'parent': [Node, ['create', 'get', 'update', 'delete']],
      'registrations': [Node, ['create', 'get', 'update', 'delete']],
      'forked_from': [Node, ['create', 'get', 'update', 'delete']]
    };
    this.magicRelationships[relationship] = new OSFClient(`${uri.protocol()}://${uri.authority()}`).clientFactory(
      pathSegment,
      modelLookup[relationship][0],
      modelLookup[relationship][1]
    );
  }
  validate() {
    // combine the required fields for all operations with the provided params
    this._data = this._apiExtend(true, this._fields,  this._params);

    // Assumes valid if all top level objects are !== null
    // making everything in this._fields required
    this._is_valid = true;
    for (var key in this._data) {
      if (this._data.hasOwnProperty(key)) {
        let item = this._data[key];
        if (
          item !== null &&
          // add more checks here
          // keep using &&
          // any untruths will invalidate
          // true === true is just an example
          true === true
        ) {
          // all true, next property pls
          continue;
        } else {
          // one false, let's blow this pop stand.
          this._is_valid = false;
          break;
        }
      }
    }

    if (this._is_valid) {
      // extend the data and set the _data property
      this._data = this._apiExtend(this._data);
    } else {
      throw Error('Your data is invalid.');
    }
  }

  getPublicInstance() {
    // this enforces validation, removes private properties and returns
    // the result
    if(this._is_valid !== true && this._is_valid !== false){
      // if _is_valid has not been set to one or the other validate
      // call getPublicInstance and return it's result.
      this.validate();
      return this.getPublicInstance();
    } else if (this._is_valid === true) {
      // if data is valid let's extend the fields and remove the
      // private properties
      let retval = this._apiExtend(this._data);
      for (var rel in retval.relationships) {
        this._add_relationship(rel, retval.relationships[rel].links.related.href);
      }
      // remove all keys that start with _
      // those are private keys
      for (var key in retval) {
        if (retval.hasOwnProperty(key)) {
          if(key.substr(0,1) === '_') {
            delete retval[key];
          }
        }
      }
      return retval;
    }else{
        throw Error('Your data is not valid.');
    }
  }
}

class User extends BaseModel {
  constructor(params) {
    super(params);
    // this allows users to leave "type": "users" out of their payload
    this._fields.type = 'users';
    this.validate();
  }
}

class Node extends BaseModel {
  constructor(params) {
    super(params);
    // this allows users to leave "type": "nodes" out of their payload
    this._fields.type = 'nodes';
    this.validate();
  }
}

class File extends BaseModel {
  constructor(params) {
    super(params);
    // this allows users to leave "type": "files" out of their payload
    this._fields.type = 'files';
    this.validate();
  }
}

export {Node};
export {User};
export {File};
export {BaseModel};
