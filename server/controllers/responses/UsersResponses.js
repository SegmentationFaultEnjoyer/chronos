
exports.UserResponse = function({ id, email, name, profile_picture }, include = null) {
    let response = {
        data: {
            id,
            type: 'user',
            attributes: {
                email,
                name,
                profile_picture
            }
        }
    }

    if(include !== null)
        response.include = include

    return response;
}

exports.UsersListResponse = function(usersList, links = {}) {
    return {
        data: usersList.map(user => ({
            id: user.id,
            type: 'user',
            attributes: {
                email: user.email,
                name: user.name,
                profile_picture: user.profile_picture
            }
        })),
        links
    }
}

exports.UserWithRoleResponse = function({ id, role, email, name, profile_picture }, include = null) {
    let response = {
        data: {
            id,
            type: 'user',
            attributes: {
                email,
                name,
                profile_picture,
                role
            }
        }
    }

    if(include !== null)
        response.include = include

    return response;
}

exports.UsersListWithRolesResponse = function(usersList, links = {}) {
    return {
        data: usersList.map(user => ({
            id: user.id,
            type: 'user',
            attributes: {
                email: user.email,
                name: user.name,
                profile_picture: user.profile_picture,
                role: user.role
            }
        })),
        links
    }
}