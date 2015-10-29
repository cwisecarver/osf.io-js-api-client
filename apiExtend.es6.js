'use strict';

var apiExtend = function apiExtend() {
    // Mostly borrowed from jQuery.extend with things to enhance the objects
    // based on aspects of the JSON-API schema.

    var options, name, src, copy, copyIsArray, clone,
    target = arguments[0] || {},
    // TODO: Add optional functionality to allow apiExtend to remove private s/_.*/g variables
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;

    // Skip the boolean and the target
    target = arguments[i] || {};
    i++;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && (Object.prototype.toString.call(copy) === '[object Function]')) {
    target = {};
  }

  // Extend jQuery itself if only one argument is passed
  if (i === length) {
    target = this;
    i--;
  }

  for (; i < length; i++) {

    // Only deal with non-null/undefined values
    if ((options = arguments[i]) != null) {

      // Extend the base object
      for (name in options) {
        src = target[name];
        copy = options[name];

        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if (deep && copy && ((Object.prototype.toString.call(copy) === '[object Object]') ||
          (copyIsArray = (Object.prototype.toString.call(copy) === '[object Array]')))) {

          if (copyIsArray) {
            copyIsArray = false;
            clone = src && (Object.prototype.toString.call(src) === '[object Array]') ? src : [];

          } else {
            clone = src && (Object.prototype.toString.call(src) === '[object Object]') ? src : {};
          }

          // Never move original objects, clone them
          target[name] = apiExtend.apply(this, [deep, clone, copy]);
          // try and lazily hydrate api urls
        } else if (typeof copy === 'string' && copy !== '') {
          var matches = copy.match(/^(https*):\/\/(\S+?)\/v2\/([a-z_]+)\/([a-z0-9]{5})*\/*([a-z_]+)*\/*$/);
          if (matches) {
            // it's likely an api url
            // destructure matches into vars
                                               /*eslint-disable no-unused-vars*/
            let [url, scheme, host, type, id, relationship] = matches;
                                              /*eslint-enable no-unused-vars*/
            let target_name = name;
            if (name === 'href') {
              // write out both if href is inside an object
              target_name = 'client';
              target[name] = options[name];
            }
            // TODO: this could probably be removed
            // the plan was to use this to add the magicRelationships
            if(type === 'nodes') {
              if (id === undefined) {
                // it's a top-level node listing view
                target[target_name] = options[name];
              } else {
                if (relationship !== undefined) {
                  // it's a relationship listing off of a node
                  target[target_name] = options[name];
                } else {
                  // it's a node detail view
                  target[target_name] = options[name];
                }
              }
            } else if (type === 'users') {
              if (id === undefined) {
                // it's a top-level user listing view
                target[target_name] = options[name];
              } else {
                if (relationship !== undefined) {
                  // it's a relationship listing off of a user
                  target[target_name] = options[name];
                } else {
                  // it's a user detail view
                  target[target_name] = options[name];
                }
              }
            } else if (type === 'files') {
              if (id === undefined) {
                // it's a top-level file listing view
                // i don't think this exists
                target[target_name] = options[name];
              } else {
                if (relationship !== undefined) {
                  // it's a relationship listing off of a file
                  target[target_name] = options[name];
                } else {
                  // it's a file detail view
                  target[target_name] = options[name];
                }
              }
            }
          } else {
            target[name] = copy;
          }
        // Don't bring in undefined values
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

export default apiExtend;
