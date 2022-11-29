export const ROUTES = Object.freeze({
    LOGIN: '/',
    MAIN: '/main',
    CALENDARS: '/calendars',
    CALENDAR: '/calendar/:id',
    EVENTS: '/calendar/:id/:date/events',
    USER: '/user/:id',
    RESET: '/reset-page/:id/:token',
    ANY: '/*'
})