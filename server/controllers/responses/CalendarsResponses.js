exports.CalendarResponse = function({ id, title, type, created_at, status, author}, 
    include = null, 
    owner) {
    
    if(!owner) owner = author
    let response = {
        data: {
            id, 
            type: "calendar",
            attributes: {
                title,
                type,
                created_at,
                status
            },
            relationships: {
                author: {
                    type: 'user',
                    id: owner.id,
                    email: owner.email,
                    name: owner.name,
                    profile_picture: owner.profile_picture
                }
            }
        }
    }

    if(include !== null)
        response.include = include

    return response;
}

exports.CalendarListResponse = function (calendarsList, links = {}) {
    return {
        data: calendarsList.map(calendar => ({
            id: calendar.calendar_id,
            type: "calendar",
            attributes: {
                title: calendar.title,
                type: calendar.type,
                created_at: calendar.created_at,
                status: calendar.status
            },
            relationships: {
                author: {
                    type: 'user',
                    id: calendar.user_id,
                    email: calendar.email,
                    name: calendar.name,
                    profile_picture: calendar.profile_picture
                }
            }
        })),
        links
    }
}
