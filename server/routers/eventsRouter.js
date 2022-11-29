const { Router } = require('express');

const eventRouter = Router();

const AuthController = require('../controllers/AuthController');
const EventController = require('../controllers/EventController');

eventRouter.get('/book-of-the-day', AuthController.CheckAuth, EventController.GetBookOfTheDay)

eventRouter.route('/:event_id')
    .all(AuthController.CheckAuth)
    .get(EventController.GetEvent) //
    .delete(EventController.DeleteEvent) //
    .patch(EventController.UpdateEvent) //

module.exports = eventRouter;