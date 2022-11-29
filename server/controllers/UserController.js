const { BadRequestError, UnauthorizedError, NotFoundError } = require('./errors/components/classes');
const ProcessError = require('./errors/handler');

const usersQ = require('../data/pg/UsersQ');

const httpStatus = require('../helpers/types/httpStatus');
const roleType = require('../helpers/types/roles');

const includeHandler = require('./include/handler');
const sortHandler = require('./sort/handler');

const { parseRegisterUserRequest, parseUpdateUserRequest } = require('./requests/UserRequests');
const { UsersListResponse, UserResponse } = require('./responses/UsersResponses');
const GenerateLinks = require('./responses/Links');

const { hash, isMatch } = require('../helpers/hashing');
const convertImg = require('../helpers/convertImage');
const { join } = require('path');
const { unlinkSync } = require('fs')

exports.GetUser = async function (req, resp) {
    try {
        const { user_id } = req.params;
        const { include } = req.query;

        let includeResp = null;

        let dbResp = await new usersQ().New().Get().WhereID(user_id).Execute();

        if(dbResp.error)
            throw new NotFoundError(`No such user: ${dbResp.error_message}`);

        if (include !== undefined)
            includeResp = await includeHandler(include, { user_id });

        resp.status(httpStatus.OK).json(UserResponse(dbResp, includeResp));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.GetUsersList = async function (req, resp) {
    try {
        const { page, limit, sort, order } = req.query;

        let Q = new usersQ().New().Get();

        if(sort !== undefined) Q = sortHandler(sort, order, Q);

        let dbResp = await Q.Paginate(limit, page).Execute(true);

        if(dbResp.error)
            throw new NotFoundError(`No users found: ${dbResp.error_message}`);

        const links = await GenerateLinks('users', Q, null, null, sort, order);

        resp.status(httpStatus.OK).json(UsersListResponse(dbResp, links));

    } catch (error) {   
        ProcessError(resp, error);
    }
}

exports.DeleteSelf = async function (req, resp) {
    try {
        const { id } = req.decoded;

        let dbResp = await new usersQ().New().Get().WhereID(id).Execute();

        if(dbResp.error)
            throw new NotFoundError(`No such user: ${dbResp.error_message}`);
        
        const { profile_picture } = dbResp;

        dbResp = await new usersQ().New().Delete().WhereID(id).Execute();

        if(dbResp.error)
            throw new Error(`Error deleting user: ${dbResp.error_message}`);

        if(profile_picture)
            unlinkSync(join(__dirname, '..', 'user_data', 'avatars', profile_picture))

        resp.status(httpStatus.NO_CONTENT).end();

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.UpdateSelf = async function (req, resp) {
    try {
        const { id } = req.decoded;

        let dbResp = await new usersQ().New().Get().WhereID(id).Execute();

        if(dbResp.error)
            throw new NotFoundError(`No such useree: ${dbResp.error_message}`);

        const { password_hash } = dbResp;
        
        const parsedReq = parseUpdateUserRequest(req.body);

        //if password is changing
        if(parsedReq.new_password && parsedReq.old_password) {
            const isPasswordValid = await isMatch(parsedReq.old_password, password_hash);

            if(!isPasswordValid)
                throw new BadRequestError('Password mismatch');

            let new_password_hash = await hash(parsedReq.new_password);

            delete parsedReq['old_password'];
            delete parsedReq['new_password'];

            parsedReq.password_hash = new_password_hash;
        }

        dbResp = await new usersQ()
            .New()
            .Update(parsedReq)
            .WhereID(id)
            .Returning()
            .Execute()

        if(dbResp.error)
            throw new Error(`Error update user info: ${dbResp.error_message}`);

        resp.status(httpStatus.OK).json(UserResponse(dbResp));

    } catch (error) {
        ProcessError(resp, error);
    }
}

exports.UploadUserAvatar = async function (req, resp) {
    try {
        if(!req.file && !req.files)
            throw new BadRequestError('File corrupted');

        const filePath = join(__dirname, '..', 'user_data');
        const pathToSavedPhoto = join(filePath, 'avatars');

        const newName = await convertImg(filePath, req.file.filename, pathToSavedPhoto);

        const { id } = req.decoded;

        let dbResp = await new usersQ()
            .New()
            .Update({profile_picture: newName})
            .WhereID(id)
            .Execute();

        if(dbResp.error)
            throw new Error(`Failed to add avatar path to db: ${dbResp.error_message}`);

        resp.status(httpStatus.CREATED).json({
            data: {
                img_url: `/images/avatar/${newName}`
            }
        });
        
    } catch (error) {
        ProcessError(resp, error);
    }
}