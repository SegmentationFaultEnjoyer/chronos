const type = require('../../helpers/types/request');
const { validateRequest } = require('./helpers/validate');
const { validateCategories } = require('./helpers/categories');

exports.parseCreateCalendarRequest = async function(requestBody) {
    validateRequest(requestBody, type.CREATE_CALENDAR);
    return {
        title: requestBody.data.attributes.title,
    }
}

exports.parseUpdateCalendarRequest = async function(requestBody) {
    validateRequest(requestBody, type.UPDATE_CALENDAR);

    let rawRequest = {
        title: requestBody.data.attributes.title,
        status: requestBody.data.attributes.status
    }

    for (let [key, value] of Object.entries(rawRequest)) {
        if (value === undefined)
            delete rawRequest[key];
    }

    return rawRequest;
}

exports.parseCalendarUserRoleRequest = async function(requestBody) {
    validateRequest(requestBody, type.CALENDAR_USER);
    return {
        role: requestBody.data.attributes.role,
    };
}
