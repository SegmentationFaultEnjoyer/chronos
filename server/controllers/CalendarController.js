const { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } = require('./errors/components/classes');
const ProcessError = require('./errors/handler');
require("dotenv").config();
const axios = require('axios')

const {
    parseCreateCalendarRequest,
    parseUpdateCalendarRequest,
    parseCalendarUserRoleRequest,
} = require('./requests/CalendarsRequests');

const { parseCreateEventRequest } = require('./requests/EventsRequests');

const {
    CalendarResponse,
    CalendarListResponse
} = require('./responses/CalendarsResponses');

const { EventResponse, EventsListResponse, RegionEventsListResponse } = require('./responses/EventResponses');
const GenerateLinks = require('./responses/Links');

const usersQ = require('../data/pg/UsersQ');
const calendarsQ = require('../data/pg/CalendarsQ');
const usersCalendarsQ = require('../data/pg/UsersCalendarsQ');
const eventsQ = require('../data/pg/EventsQ');

const includeHandler = require('./include/handler');
const sortHandler = require('./sort/handler');

const type = require('../helpers/types/calendars');
const status = require('../helpers/types/status');
const roles = require('../helpers/types/roles');
const httpStatus = require('../helpers/types/httpStatus');
const { UsersListWithRolesResponse, UserWithRoleResponse, UserResponse } = require('./responses/UsersResponses');
const { sendAddToCalendarNotification } = require('../helpers/sendToMail');
const { sendNotificationToClient } = require('../helpers/socketNotificator');


exports.CreateCalendar = async function (req, resp) {
    try {
        const { title } = await parseCreateCalendarRequest(req.body);
        const { id } = req.decoded;

        let dbResp = await new calendarsQ()
            .New()
            .Insert(
                {
                    author: id,
                    title,
                    type: type.ADDITIONAL,
                    created_at: new Date().toISOString(),
                    status: status.ACTIVE
                }
            )
            .Returning()
            .Execute()

        if (dbResp.error)
            throw new Error(`Error creating calendar: ${dbResp.error_message}`);
        
        let usersCalendarsdbResp = await new usersCalendarsQ()
            .New()
            .Insert(
                {
                    user_id: id,
                    calendar_id: dbResp.id,
                    role: "admin"
                }
            )
            .Returning()
            .Execute()

        if (usersCalendarsdbResp.error)
            throw new Error(`Error creating calendar: ${usersCalendarsdbResp.error_message}`);

        resp.status(httpStatus.CREATED).json(CalendarResponse(dbResp));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.CreateUserRole = async function (req, resp) {
    try {
        const { role } = await parseCalendarUserRoleRequest(req.body);
        const { calendar_id, user_email } = req.params;
        const { id } = req.decoded;
        let dbResp = await new usersCalendarsQ()
            .New()
            .Get()
            .WhereCalendarID(calendar_id)
            .WhereUserID(id)
            .Execute()

        if (dbResp.error)
            throw new Error(`Error get user : ${dbResp.error_message}`);
        
        if (dbResp.role != roles.ADMIN)
            throw new Forbidden(`Permission denied : only admins of this calendar can add users`);
        
        const {title} = dbResp

        dbResp = await new usersQ()
            .New()
            .Get()
            .WhereEmail(user_email)
            .Execute()

        if (dbResp.error)
            throw new Error(`Error get user : ${dbResp.error_message}`);
        
        if (dbResp.id == id)
            throw new BadRequestError(`Error add user : You can't add self to calendar`);
        
        user = dbResp
        dbResp = await new usersCalendarsQ()
        .New()
        .Get()
        .WhereCalendarID(calendar_id)
        .WhereUserID(user.id)
        .Execute()

        if (dbResp.user_id) {
            throw new BadRequestError(`Error add user : The user is already in calendar`);
        }

        dbResp = await new usersCalendarsQ()
            .New()
            .Insert(
                {
                    user_id: user.id,
                    calendar_id: calendar_id,
                    role
                }
            )
            .Returning()
            .Execute()

        if (dbResp.error)
            throw new Error(`Error adding user : ${dbResp.error_message}`);
        
        dbResp = await new usersCalendarsQ()
            .New()
            .Get("calendars.*")
            .Join("calendars on calendars.id = users_calendars.calendar_id")
            .Join("users on users.id = users_calendars.user_id")
            .WhereCalendarID(calendar_id)
            .Execute();


        if (dbResp.error)
            throw new Error(`Error adding comment : ${dbResp.error_message}`);

        if(!Number(process.env.DISABLE_MAILGUN)) {
            sendAddToCalendarNotification(user_email, dbResp.title, role, calendar_id)
        }
        sendNotificationToClient(`You have new permissions as ${role} in ${dbResp.title} calendar`, user.id)
        resp.status(httpStatus.CREATED).json(UserWithRoleResponse({...user, role}));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.CreateEvent = async function (req, resp) {
    try {
        const { title, description, start, finish, colour, type } = parseCreateEventRequest(req.body);
        const { id } = req.decoded;
        const { calendar_id } = req.params;
        let dbResp = await new usersCalendarsQ()
        .New()
        .Get()
        .WhereCalendarID(calendar_id)
        .WhereUserID(id)
        .Execute()

        if (dbResp.error)
            throw new Error(`Error get user : ${dbResp.error_message}`);
        
        if (dbResp.role != roles.ADMIN && dbResp.role != roles.MANAGER)
            throw new Forbidden(`Permission denied : only admins of this calendar can add users`);
        dbResp = await new eventsQ()
            .New()
            .Insert(
                {
                    author: id,
                    title, description, start, finish, colour, type,                    
                    calendar_id
                }
            )
            .Returning()
            .Execute()

        if (dbResp.error)
            throw new Error(`Error creating event: ${dbResp.error_message}`);
        
        resp.status(httpStatus.CREATED).json(EventResponse(dbResp));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.UpdateUserRole = async function (req, resp) {
    try {
        const { role } = await parseCalendarUserRoleRequest(req.body);
        const { calendar_id, user_id } = req.params;
        const { id } = req.decoded;
        let dbResp = await new usersCalendarsQ()
            .New()
            .Get()
            .WhereCalendarID(calendar_id)
            .WhereUserID(id)
            .Execute()

        if (dbResp.error)
            throw new Error(`Error get user : ${dbResp.error_message}`);
        
        if (dbResp.role != roles.ADMIN)
            throw new Forbidden(`Permission denied : only admins of this calendar can update users`);
        
        dbResp = await new usersCalendarsQ()
            .New()
            .Get("users.*")
            .Join("users on users.id = users_calendars.user_id")
            .WhereCalendarID(calendar_id)
            .WhereUserID(user_id)
            .Execute()

        if (dbResp.error)
            throw new Error(`Error get user : ${dbResp.error_message}`);
        user = dbResp

        dbResp = await new usersCalendarsQ()
            .New()
            .Update({role})
            .WhereCalendarID(calendar_id)
            .WhereUserID(user_id)
            .Returning()
            .Execute()

        if (dbResp.error)
            throw new Error(`Error updating user: ${dbResp.error_message}`);

        dbResp = await new calendarsQ()
            .New()
            .Get()
            .WhereID(calendar_id)
            .Execute();


        if (dbResp.error)
            throw new Error(`Error updating user : ${dbResp.error_message}`);
        if(!Number(process.env.DISABLE_MAILGUN)) {
            sendAddToCalendarNotification(user.email, dbResp.title, role, calendar_id)
        }
        sendNotificationToClient(`You have new permissions as ${role} in ${dbResp.title} calendar`, user.id)
        resp.status(httpStatus.CREATED).json(UserWithRoleResponse({...user, role}));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.DeleteUser = async function (req, resp) {
    try {
        const { calendar_id, user_id } = req.params;
        const { id } = req.decoded;
        let dbResp = await new usersCalendarsQ()
            .New()
            .Get()
            .WhereCalendarID(calendar_id)
            .WhereUserID(id)
            .Execute()

        if (dbResp.error)
            throw new Error(`Error get user : ${dbResp.error_message}`);
        
        if (dbResp.role != roles.ADMIN)
            throw new Forbidden(`Permission denied : only admins of this calendar can delete users`);
        
        dbResp = await new usersCalendarsQ()
            .New()
            .Delete()
            .WhereCalendarID(calendar_id)
            .WhereUserID(user_id)
            .Execute()

        if (dbResp.error)
            throw new Error(`Error get user : ${dbResp.error_message}`);

        resp.status(httpStatus.NO_CONTENT).end();

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.GetCalendar = async function (req, resp) {
    try {
        const { calendar_id } = req.params;
        const { include } = req.query;
        const { id } = req.decoded;

        let includeResp = null;


        let dbResp = await new calendarsQ().New().Get().WhereID(calendar_id).Execute();

        if (dbResp.error)
            throw new BadRequestError(`Error getting calendar: ${dbResp.error_message}`);

        if (include !== undefined)
            includeResp = await includeHandler(include, { calendar_id });

        const owner = await new usersQ().New().Get().WhereID(dbResp.author).Execute()

        if (owner.error)
            throw new NotFoundError(`Error getting owner: ${owner.error_message}`);

        resp.status(httpStatus.OK).json(CalendarResponse(dbResp, includeResp, owner));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.GetCalendarsList = async function (req, resp) {
    try {
        const { page, limit, sort, order, filter } = req.query;
        const { id } = req.decoded;

        let Q = new usersCalendarsQ().New()
                .Get()
                .Join("calendars on calendars.id = users_calendars.calendar_id")
                .Join("users on users.id = users_calendars.user_id")
                .WhereUserID(id)
                .WhereHasPermission()
        

        if (sort !== undefined) Q = sortHandler(sort, order, Q);


        
        if (filter !== undefined && filter.type) {
            Q = Q.WhereType(filter.type)
        }
        let dbResp = await Q.Paginate(limit, page).Execute(true);

        if (dbResp.error)
            throw new NotFoundError(`No calendars found: ${dbResp.error_message}`);

        const links = await GenerateLinks('calendars', 
        Q, 
        `JOIN calendars on calendars.id = users_calendars.calendar_id
        JOIN users on users.id = users_calendars.user_id
        WHERE user_id=${id} AND 
        (role = 'admin' or status = true)`, 
        filter, 
        sort, order, 
        'calendars.id');
        // console.log(dbResp);
        resp.status(httpStatus.OK).json(CalendarListResponse(dbResp, links));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.GetUserList = async function (req, resp) {
    try {
        const { calendar_id } = req.params;
        const { page, limit, sort, order } = req.query;

        let Q = new usersCalendarsQ().New()
        .Get("users.*, role")
        .Join("calendars on calendars.id = users_calendars.calendar_id")
        .Join("users on users.id = users_calendars.user_id")
        .WhereCalendarID(calendar_id);

        if (sort !== undefined) Q = sortHandler(sort, order, Q);

        let dbResp = await Q.Paginate(limit, page).Execute(true);

        if (dbResp.error)
            throw new NotFoundError(`No comments found: ${dbResp.error_message}`);

        const links = await GenerateLinks(
            `calendars/${calendar_id}/users`,
            Q,
            `JOIN calendars on calendars.id = users_calendars.calendar_id
            JOIN users on users.id = users_calendars.user_id
            WHERE calendar_id=${calendar_id}`,
            undefined,
            sort,
            order,
            'user_id');

        resp.status(httpStatus.OK).json(UsersListWithRolesResponse(dbResp, links));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.GetEventsList = async function (req, resp) {
    try {
        const { calendar_id } = req.params;
        const { page, limit, sort, order, filter } = req.query;
        //console.log(start, start.lt);
        let Q = new eventsQ().New()
        .Get()
        .WhereCalendarID(calendar_id);

        if (filter && filter.start) {            
            Q = Q.WhereStart(filter.start)
        }       
        
        if (sort !== undefined) Q = sortHandler(sort, order, Q);
        

        let dbResp = await Q.Paginate(limit, page).Execute(true);

        if (dbResp.error)
            throw new NotFoundError(`No events found: ${dbResp.error_message}`);

        const links = await GenerateLinks(
            `calendars/${calendar_id}/events`,
            Q,
            `WHERE calendar_id=${calendar_id}`,
            undefined,
            sort,
            order);

        resp.status(httpStatus.OK).json(EventsListResponse(dbResp, links));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.GetRegionEventsList = async function (req, resp) {
    try {
        const { lat, lng, year, month, day } = req.query;
       
        let res = await axios.get(`http://api.geonames.org/countryCodeJSON?lat=${lat}&lng=${lng}&username=mango`)
        
        let link = `https://calendarific.com/api/v2/holidays?&api_key=b4655808decb52251b5b1ab6f2afb5b546229b3c&country=${res.data.countryCode}`
        
        if (year) link += '&year=' + year
        if (month) link += '&month=' + month
        if (day) link += '&day=' + day
        res = await axios.get(link)
        resp.status(httpStatus.OK).json(RegionEventsListResponse(res.data.response.holidays));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.UpdateCalendar = async function (req, resp) {
    try {
        const { calendar_id } = req.params;
        const { id, role } = req.decoded;

        let dbResp = await new calendarsQ().New().Get().WhereID(calendar_id).Execute();

        if (dbResp.error)
            throw new BadRequestError(`Error getting calendar: ${dbResp.error_message}`);

        const { author } = dbResp;

        if (author !== id && role !== roles.ADMIN)
            throw new UnauthorizedError('Access denied for that operation');

        const parsedReq = await parseUpdateCalendarRequest(req.body);

        dbResp = await new calendarsQ()
            .New()
            .Update(parsedReq)
            .WhereID(calendar_id)
            .Returning()
            .Execute()

        if (dbResp.error)
            throw new Error(`Error updating calendar: ${dbResp.error_message}`);

        const owner = await new usersQ().New().Get().WhereID(dbResp.author).Execute()

        if (owner.error)
            throw new NotFoundError(`Error getting owner: ${owner.error_message}`);

        resp.json(CalendarResponse(dbResp, null, owner));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.DeleteCalendar = async function (req, resp) {
    try {
        const { calendar_id } = req.params;
        const { id, role } = req.decoded;

        let dbResp = await new calendarsQ().New().Get().WhereID(calendar_id).Execute();

        if (dbResp.error)
            throw new NotFoundError(`No such calendar: ${dbResp.error_message}`);

        const { author } = dbResp;

        if (dbResp.type = type.MAIN || id !== author && role !== roles.ADMIN)
            throw new ForbiddenError('No permission for deleting that calendar')

        dbResp = await new calendarsQ().New().Delete().WhereID(calendar_id).Execute();

        if (dbResp.error)
            throw new BadRequestError(`Error deleting calendar: ${dbResp.error_message}`);

        resp.status(httpStatus.NO_CONTENT).end();

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.DeleteLike = async function (req, resp) {
    try {
        const { calendar_id } = req.params;
        const { id } = req.decoded;

        let dbResp = await new likesQ().New().Delete().WhereCalendarID(calendar_id).WhereAuthor(id).Execute();

        if (dbResp.error)
            throw new Error(`Error deliting like: ${dbResp.error_message}`);

        resp.status(httpStatus.NO_CONTENT).end();

    } catch (error) {
        ProcessError(resp, error);
    }
}