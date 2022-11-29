exports.EventLikesListResponse = function(list, links = {}) {
    return {
        data: list.map(like => ({
            id: like.id,
            attributes: {
                publish_date: like.publish_date,
                liked_on: like.liked_on,
                is_dislike: like.is_dislike
            },
            relationships: {
                author: {
                    id: like.author,
                    type: 'user'
                },
                event: {
                    id: like.event_id,
                    type: 'event'
                }
            }
            
        })),
        links
    }
}

exports.EventLikeResponse = function ({ id, author, publish_date, liked_on, is_dislike, event_id }) {
    return {
        data: {
            id,
            type: "like",
            attributes: {
                publish_date,
                liked_on,
                is_dislike
            },
            relationships: {
                author: {
                    id: author,
                    type: 'user'
                },
                event: {
                    id: event_id,
                    type: 'event'
                }
            }
        }
    }
}

exports.EventResponse = function ({ id, author, title, description, start, finish, colour, type}, include = null) {
    let response = {
        data: {
            id: id,
            type: "event",
            attributes: {
                title: title,
                description: description,
                start: start,
                finish: finish,
                colour: colour,
                type: type
            },
            relationships: {
                author: {
                    id: author,
                    type: 'user'
                }
            }
        }
    }

    if(include !== null)
        response.include = include

    return response;
}

exports.EventsListResponse = function (eventsList) {
    return {
        data: eventsList.map(event => ({
            id: event.id,
            type: "event",
            attributes: {
                title: event.title,
                description: event.description,
                start: event.start,
                finish: event.finish,
                colour: event.colour,
                type: event.type
            },
            relationships: {
                author: {
                    id: event.author,
                    type: 'user'
                },
                calendar: {
                    id: event.calendar_id,
                    type: 'calendar'
                }
            }
        }))
    }
}


exports.RegionEventsListResponse = function (eventsList, links = {}) {
    return {
        data: eventsList.map(event => ({
            id: event.id,
            type: "event",
            attributes: {
                title: event.name,
                description: event.description,
                finish: event.date.iso,
                type: 'holiday'
            }
        })),
        links
    }
}