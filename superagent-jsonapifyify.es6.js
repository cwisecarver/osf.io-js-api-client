import _ from 'underscore';

module.exports = (request) => {
    // make sure superagent is around
    let superagent = (request) ? request : require('superagent');

    // only patch once
    if (superagent.patchedByJSONAPIfyify) {
        return superagent;
    }

    // mark our territory
    superagent.patchedByJSONAPIfyify = true;
    // setup the parser for json api mime type
    superagent.parse['application/vnd.api+json'] = _.partial(parseJSONAPI, superagent);
    // setup the serializer for json api mime type
    // TODO: this could eventually validate the proper fields before submission to the api
    superagent.serialize['application/vnd.api+json'] = JSON.stringify;
};

var parseJSONAPI = (agent, resp_text) => {
    // superagent instance gets passed in here so that we can replace all urls
    // with client instances
    let resp_json = JSON.parse(resp_text);
    return jsonapifyifyTheData(agent, resp_json.data);
};

var jsonapifyifyOneObject = (agent, data) => {

    // start with an empty object
    var result = {};

    // pull all attributes out onto a top level object
    result.attributes = {};
    _.each(data.attributes, (value, name) => {
       Object.defineProperty(result.attributes, name, { value: value});
    });

    // pull all embeds out onto a top level object, jsonapiifyifying them as we go
    result.embeds = {};
    _.each(data.embeds, (value, name) => {
        if (_.isArray(value)) {
            Object.defineProperty(result.embeds, name, {
                get: () => {
                  return _.map(value, _.partial(jsonapifyifyOneObject, agent));
                }
            });
        } else if (value) {
            Object.defineProperty(result.embeds, name, {
               get: () => {
                   return value ? jsonapifyifyOneObject(value) : null;
               }
            });
        }
    });


    // pull all relationships out onto a top level object and turn them into
    // client instances
    result.relationships = {};
    _.each(data.relationships, (value, name) => {
        let href = value.links.related.href;
        Object.defineProperty(result.relationships, name, {
            get: () => {
                return agent.get(href);
            }
        });
    });

    // pull all links out onto a top level object and turn them into
    // client instances
    result.links = {};
    _.each(data.links, (value, name) => {
        let href = value;
        if (href.match(/^https*:\/\//i)) {
            Object.defineProperty(result.links, name, {
                get: () => {
                   return agent.get(href);
                }
            });
        }
    });

    // stick the original data we got back from the api into a property on the
    // result that we send back.
    result._data = _.clone(data);
    return result;
};

var jsonapifyifyTheData = (agent, data) => {
    if(!data) {
        // it's not a thing, return
        return data;
    } else if (_.isArray(data)) {
        return _.map(data, _.partial(jsonapifyifyOneObject, agent));
    } else {
        return jsonapifyifyOneObject(agent, data);
    }
};
