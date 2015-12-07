'use strict';

import Raven from 'raven-js';
import URI from 'URIjs';
import agent from 'superagent-es6';
import jsonapifyify from './superagent-jsonapifyify.es6';
jsonapifyify(agent);

window.agent = agent;

import apiExtend from './apiExtend.es6.js';
import baseModel from './models.es6.js';

const DEFAULT_URL = 'https://api.osf.io/v2/';

class Session {
    constructor(rootUrl, auth = null) {
        this.agent = agent;
        this.rootUrl = rootUrl || DEFAULT_URL;
        this.baseModel = baseModel;
        this.DEFAULT_AJAX_OPTIONS = {
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            }
        };
        let authHeader = {};
        if (auth) {
            // btoa, the most descriptive function name ever.
            let encodedCredentials = window.btoa(`${auth.username}:${auth.password}`);
            // lets set a global property to share across different clients
            authHeader = window.__osfClient.authHeader = {
                'Authorization': `Basic ${encodedCredentials}`
            };
        } else {
            // they didn't pass auth, let's see if it's in the global
            if (window.__osfClient && typeof window.__osfClient.authHeader !== 'undefined') {
                authHeader = window.__osfClient.authHeader;
            }
        }
        // this does a deep extend which will add the authorization header to the
        // headers defined in DEFAULT_AJAX_OPTIONS. It will only overwrite another
        // "Authorization" header.
        this.DEFAULT_AJAX_OPTIONS = apiExtend(true, this.DEFAULT_AJAX_OPTIONS, {
            'headers': authHeader
        });
    }

    get(url, params, model) {
        // if they didn't specify a model just use the base
        if (typeof model == 'undefined') {
            model = this.baseModel;
        }

        return this._request('GET', url, params)
            .then(resp => {
                // if data is an array create a model instance of each item and replace
                // the originals
                if (Object.prototype.toString.call(resp.data) === '[object Array]') {
                    let modelInstance = resp.data.map(item => {
                        return new model(item).getPublicInstance();
                    });
                    // extend the resp object by overriding data hydrated model instances
                    return apiExtend(resp, {
                        'data': modelInstance
                    });
                } else {
                    // resp.data is one object. Replace it will a model instance
                    resp.data = new model(resp.data).getPublicInstance();
                    return resp;
                }
            });
    }

    post(url, params, model) {
        // create a new model with the incoming params
        let instance = new model(params);
        instance.validate();

        // create an object that can be extended into fetch.options
        let jsonData = {
            body: {
                data: instance.getPublicInstance()
            }
        };

        return this._request('POST', url, jsonData)
            .then(resp => {
                // map the response to a model, send it back.
                instance = new model(resp.data);
                instance.validate();
                resp.data = instance.getPublicInstance();
                return resp;
            });
    }

    patch(url, params, model) {
        // if they didn't specify a model just use the base
        if (typeof model == 'undefined') {
            model = this.baseModel;
        }
        // create a new model with the incoming params
        let instance = new model(params);
        // create an object that can be extended into fetch.options
        let jsonData = {
            body: {
                data: instance.getPublicInstance()
            }
        };
        return this._request('PATCH', url, jsonData)
            .then(resp => {
                resp.data = new model(resp.data).getPublicInstance();
                return resp;
            });
    }

    delete(url) {
        // make a delete request to the specified url with an empty payload.
        return this._request('DELETE', url, {})
            .then((resp) => {
                return resp;
            });
    }

    _request(method, url, params = {}) {
        // generate v2Url from requested url and contextVars
        var v2Url = this.apiV2Url(url, {
            prefix: this.rootUrl
        });
        // create the request
        let request = this.agent(method, v2Url).withCredentials();
        // if it's not a GET it may have a body otherwise it may have a querystring
        if (method !== 'GET') {
            // a body
            request.send(params.body || {});
        } else {
            // a querystring
            request.query(params.query || {});
        }

        for (var headerName in this.DEFAULT_AJAX_OPTIONS.headers) {
          if (this.DEFAULT_AJAX_OPTIONS.headers.hasOwnProperty(headerName)) {
            request.set({headerName: this.DEFAULT_AJAX_OPTIONS.headers[headerName]});
          }
        }

        return request.then(resp => {
            if (resp.status >= 200 && resp.status < 300) {
                if (resp.status !== 204) {
                    return resp.body;
                } else {
                    return resp;
                }
            } else {
                var error = new Error(resp.text);
                error.response = resp;
                throw error;
            }
        });
    }

    /**
     * Generate OSF absolute URLs, including prefix and arguments. Assumes access to mako globals for pieces of URL.
     * Can optionally pass in an object with params (name:value) to be appended to URL. Calling as:
     *   apiV2Url('users/4urxt/applications',
     *      {query:
   *          {'a':1, 'filter[fullname]': 'lawrence'},
   *       prefix: 'https://staging2.osf.io/api/v2/'})
     * would yield the result:
     *  'https://staging2.osf.io/api/v2/users/4urxt/applications?a=1&filter%5Bfullname%5D=lawrence'
     * @param {String} path The string to be appended to the absolute base path, eg 'users/4urxt'
     * @param {Object} options (optional)
     */
    apiV2Url(path, options) {
        var contextVars = window.contextVars || {};
        var defaultPrefix = contextVars.apiV2Prefix || 'https://api.osf.io/v2/';

        var defaults = {
            prefix: defaultPrefix, // Manually specify the prefix for API routes (useful for testing)
            query: {} // Optional query parameters to be appended to URL
        };
        var opts = apiExtend(true, {}, defaults, options);

        var apiUrl = URI(opts.prefix);
        var pathSegments = URI(path).segment();
        pathSegments.forEach(function (el) {
            apiUrl.segment(el);
        }); // Hack to prevent double slashes when joining base + path
        apiUrl.query(opts.query);

        return apiUrl.toString();
    }

    captureError(message, callback) {
        /**
         * Return a generic error handler for requests.
         * Log to Sentry with the given message.
         *
         * Usage:
         *     client.makeRequest()
         *          .fail(this.captureError('Failed to make request'));
         */
        let DEFAULT_ERROR_MESSAGE = 'Request failed.';
        return function (xhr, status, error) {
            Raven.captureMessage(message || DEFAULT_ERROR_MESSAGE, {
                xhr: xhr,
                status: status,
                error: error
            });
            // Additional error-handling
            callback && callback(xhr, status, error);
        };
    }
}

export default Session;
