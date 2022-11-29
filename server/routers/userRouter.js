const { Router } = require('express');

const userRouter = Router();

const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');

const { downloadSingle } = require('../helpers/fileDownloader');

userRouter.route('/')
    .all(AuthController.CheckAuth)
    .get(UserController.GetUsersList) //
    .delete(UserController.DeleteSelf) //
    .patch(UserController.UpdateSelf) //

userRouter.patch('/avatar', AuthController.CheckAuth, downloadSingle, UserController.UploadUserAvatar);

userRouter.route('/:user_id')
    .all(AuthController.CheckAuth)
    .get(UserController.GetUser)

module.exports = userRouter;