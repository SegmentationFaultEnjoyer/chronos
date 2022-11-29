const { BadRequestError, UnauthorizedError, NotFoundError } = require('./errors/components/classes');
const ProcessError = require('./errors/handler');

const eventsQ = require('../data/pg/EventsQ');

const includeHandler = require('./include/handler');
const sortHandler = require('./sort/handler');

const {
    EventLikeResponse,
    EventLikesListResponse,
    EventResponse
} = require('./responses/EventResponses');
const GenerateLinks = require('./responses/Links');
const browserObject = require('../helpers/books/browser');
const scraperController = require('../helpers/books/pageController');


const { parseCreateLikeRequest } = require('./requests/PostsRequests');
const { parseUpdateEventRequest } = require('./requests/EventsRequests');

const roles = require('../helpers/types/roles');
const httpStatus = require('../helpers/types/httpStatus');
const action = require('../helpers/types/ratingAction');

const { handleRating } = require('../helpers/rating');

exports.GetEvent = async function (req, resp) {
    try {
        const { event_id } = req.params;
        const { include, filter } = req.query;

        let includeResp = null;
        let dbResp = await new eventsQ().New().Get().WhereID(event_id).Execute();

        if (dbResp.error)
            throw new NotFoundError(`No such event: ${dbResp.error_message}`);

        if (include !== undefined)
            includeResp = await includeHandler(include, { event_id });

        resp.status(httpStatus.OK).json(EventResponse(dbResp, includeResp));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.GetBookOfTheDay = async function (req, resp) {
    try {
        //Start the browser and create a browser instance
        let browserInstance = browserObject.startBrowser();

        // Pass the browser instance to the scraper controller
        scraperController(browserInstance)
        
        resp.status(httpStatus.NO_CONTENT).end()

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.DeleteEvent = async function (req, resp) {
    try {
        const { event_id } = req.params;
        const { id, role } = req.decoded;

        let dbResp = await new eventsQ().New().Get().WhereID(event_id).Execute();

        if (dbResp.error)
            throw new NotFoundError(`No such event: ${dbResp.error_message}`);

        const { author } = dbResp;

        if (id !== author && role !== roles.ADMIN)
            throw new UnauthorizedError(`No permission for that action`);

        dbResp = await new eventsQ().New().Delete().WhereID(event_id).Execute();

        if (dbResp.error)
            throw new Error(`Error deleting event: ${dbResp.error_message}`);

        resp.status(httpStatus.NO_CONTENT).end();

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.UpdateEvent = async function (req, resp) {
    try {
        console.log('here');
        const { event_id } = req.params;
        const { id } = req.decoded;

        let dbResp = await new eventsQ().New().Get().WhereID(event_id).Execute();

        if (dbResp.error)
            throw new NotFoundError(`No such event: ${dbResp.error_message}`);

        const { author } = dbResp;

        if (author !== id)
            throw new UnauthorizedError('No permissions for that action');

        const parseReq = parseUpdateEventRequest(req.body);

        dbResp = await new eventsQ()
            .New()
            .Update(parseReq)
            .WhereID(event_id)
            .Returning()
            .Execute();

        if (dbResp.error)
            throw new Error(`Error updating event: ${dbResp.error_message}`);

        resp.status(httpStatus.OK).json(EventResponse(dbResp));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.CreateLike = async function (req, resp) {
    try {
        const { event_id } = req.params;
        const { id } = req.decoded;
        const { is_dislike, liked_on } = parseCreateLikeRequest(req.body);

        let dbResp = await new likesQ().New().Get().WhereAuthor(id).WhereEventID(event_id).Execute();

        if (!dbResp.error && dbResp.is_dislike === is_dislike)
            throw new BadRequestError('You already did that action to this post');


        await new likesQ().Transaction(async () => {
            //if no such like entity exists
            if (dbResp.error) {
                dbResp = await new likesQ()
                    .New()
                    .Insert(
                        {
                            author: id,
                            publish_date: new Date().toISOString(),
                            liked_on,
                            is_dislike,
                            event_id
                        }
                    )
                    .Returning()
                    .Execute();

                if (dbResp.error)
                    throw new Error(`Error creating like: ${dbResp.error_message}`);
            }

            //probably this will be triggered when you smashing dislike instead of like and vice versa
            else {
                dbResp = await new likesQ().New()
                    .Update(
                        {
                            is_dislike: !dbResp.is_dislike,
                            publish_date: new Date().toISOString()
                        }
                    )
                    .WhereAuthor(id)
                    .WhereEventID(event_id)
                    .Returning()
                    .Execute();

                if (dbResp.error)
                    throw new Error(`Error changing like ${error.error_message}`);
            }

            const actionType = is_dislike ? action.DECREASE : action.INCREASE;
            await handleRating(actionType, liked_on, event_id);
        })

        resp.status(httpStatus.CREATED).json(EventLikeResponse(dbResp));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.DeleteLike = async function (req, resp) {
    try {
        const { event_id } = req.params;
        const { id } = req.decoded;

        let dbResp = await new likesQ().New().Delete().WhereAuthor(id).WhereEventID(event_id).Execute();

        if (dbResp.error)
            throw new Error(`Error deleting like: ${dbResp.error_message}`);

        resp.status(httpStatus.NO_CONTENT).end();

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.GetLikesList = async function (req, resp) {
    try {
        const { event_id } = req.params;
        const { page, limit, sort, order } = req.query;

        let Q = new likesQ().New().Get().WhereEventID(event_id);

        if(sort !== undefined) Q = sortHandler(sort, order, Q);

        let dbResp = await Q.Paginate(limit, page).Execute(true);

        if (dbResp.error)
            throw new NotFoundError(`No likes found: ${dbResp.error_message}`);

        const links = await GenerateLinks(`events/${event_id}/like`, Q, `WHERE event_id=${event_id}`);

        resp.status(httpStatus.OK).json(EventLikesListResponse(dbResp, links));

    } catch (error) {
        ProcessError(resp, error);
    }
}