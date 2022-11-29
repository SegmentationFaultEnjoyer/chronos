const type = require('../../helpers/types/request');
const { validateRequest } = require('./helpers/validate');

exports.parseUpdateEventRequest = function(requestBody) {
    validateRequest(requestBody, type.UPDATE_EVENT);

    let rawRequest = {
        title: requestBody.data.attributes.title,
        description: requestBody.data.attributes.description,
        start: requestBody.data.attributes.start,
        finish: requestBody.data.attributes.finish,
        colour: requestBody.data.attributes.colour,
        type: requestBody.data.attributes.type,
    }

    for (let [key, value] of Object.entries(rawRequest)) {
        if (value === undefined)
            delete rawRequest[key];
    }

    return rawRequest
}

exports.parseCreateEventRequest = function(requestBody) {
    validateRequest(requestBody, type.CREATE_EVENT);
    let rawRequest = {
        title: requestBody.data.attributes.title,
        description: requestBody.data.attributes.description,
        start: requestBody.data.attributes.start,
        finish: requestBody.data.attributes.finish,
        colour: requestBody.data.attributes.colour,
        type: requestBody.data.attributes.type,
    }

    for (let [key, value] of Object.entries(rawRequest)) {
        if (value === undefined)
            delete rawRequest[key];
    }

    return rawRequest
}