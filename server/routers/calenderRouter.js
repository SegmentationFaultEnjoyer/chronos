const { Router } = require('express');

const calendarRouter = Router();

const AuthController = require('../controllers/AuthController');
const CalendarController = require('../controllers/CalendarController');



calendarRouter.route('/region-events/')
    .all(AuthController.CheckAuth)
    .get(CalendarController.GetRegionEventsList)


calendarRouter.route('/:calendar_id')
    .all(AuthController.CheckAuth)
    .patch(CalendarController.UpdateCalendar) //
    .get(CalendarController.GetCalendar) //
    .delete(CalendarController.DeleteCalendar) //

calendarRouter.route('/:calendar_id/users/')
    .all(AuthController.CheckAuth)
    .get(CalendarController.GetUserList) 

calendarRouter.route('/:calendar_id/events/')
    .all(AuthController.CheckAuth)
    .get(CalendarController.GetEventsList) //
    .post(CalendarController.CreateEvent) //
    
calendarRouter.route('/:calendar_id/users/:user_email')
.all(AuthController.CheckAuth)
    .post(CalendarController.CreateUserRole)

calendarRouter.route('/:calendar_id/users/:user_id')
    .all(AuthController.CheckAuth)
    .patch(CalendarController.UpdateUserRole)
    .delete(CalendarController.DeleteUser)
 
calendarRouter.route('/')
    .all(AuthController.CheckAuth)
    .post(CalendarController.CreateCalendar) //
    .get(CalendarController.GetCalendarsList) // need to check with different roles

module.exports = calendarRouter;