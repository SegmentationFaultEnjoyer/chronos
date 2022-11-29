import { api } from "@/api"
import { Notificator } from "@/common"
import { ErrorHandler } from "@/helpers"
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useState } from "react"

const LIMIT = 100;

export function useEvents(calendarID) {
    const [events, setEvents] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    const getEventsList = async (filter = null) => {
        setIsLoading(true)
        try {
            let URL = `/calendars/${calendarID}/events?limit=${LIMIT}`

            if (filter) URL = URL.concat(`&filter[${filter.type}]="${filter.value}"`)

            const { data } = await api.get(URL)

            // if (!data.data.length) return navigate(`/calendars/${calendarID}`)

            console.log(data.data);

            setEvents(data.data)
        } catch (error) {
        }
        setIsLoading(false)
    }

    const createEvent = async (title, description, start = undefined, finish, colour, type ) => {
        try {
            const { data: { data } } = await api.post(`/calendars/${calendarID}/events`, {
                data: {
                    type: 'create-event',
                    attributes: {
                        title,
                        description,
                        start,
                        finish,
                        colour,
                        type
                    }
                }
            })

            setEvents(prev => [...prev, data])
            
            Notificator.success('Event created')
        } catch (error) {
            ErrorHandler.process(error)
        }
    }

    const deleteEvent = async (id) => {
        await api.delete(`events/${id}`)

        setEvents(prev => prev.filter(event => event.id !== id))
    }

    //data {title, description, start, finish, colour}
    const updateEvent = async (id, info) => {
        try {
            const { data: { data } } = await api.patch(`events/${id}`, {
                data: {
                    type: 'update-event',
                    attributes: {
                        title: info.title,
                        description: info.description,
                        start: info.start,
                        finish: info.finish,
                        colour: info.colour
                    }
                }
            })  

            const index = events.findIndex(event => event.id === data.id)

            //if start date is changed the event is no longer in this list
            if (!dayjs(events[index].attributes.start).isSame(data.attributes.start)) {
                setEvents(prev => prev.filter(el => el.id !== data.id))
                return
            }

            setEvents(prev => {
                const newEvents = [...prev]
                newEvents[index] = data

                return newEvents
            })

        } catch (error) {
            ErrorHandler.process(error)
        }
    }

    return {
        events,
        isLoading,
        getEventsList,
        createEvent,
        deleteEvent,
        updateEvent
    }
}