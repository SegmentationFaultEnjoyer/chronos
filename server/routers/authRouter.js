const { Router } = require('express');

const authRouter = Router();

const AuthController = require('../controllers/AuthController');

authRouter.get('/', AuthController.CheckAuth, AuthController.GetUserInfo); //

authRouter.get('/logout', AuthController.CheckAuth, AuthController.LogOut); //

authRouter.post('/login', AuthController.LogIn); //

authRouter.post('/refresh', AuthController.Refresh); // didn't check

authRouter.post('/register', AuthController.Register); //

authRouter.route('/reset-password/:user_id/:token')
    .get(AuthController.GetResetForm) // didn't check
    .post(AuthController.ChangePassword) // didn't check

authRouter.post('/reset-password', AuthController.ResetPassword); // didn't check

module.exports = authRouter;