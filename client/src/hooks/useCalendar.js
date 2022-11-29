import { api } from "@/api";
import { Notificator } from "@/common";
import { ErrorHandler } from "@/helpers";
import { useState } from "react";

export function useCalendar() {
    const [isLoading, setIsLoading] = useState(true)
    const [calendars, setCalendars] = useState({})
    const [regionEvents, setRegionEvents] = useState(null)

    const createCalendar = async (title) => {
        try {
            await api.post('/calendars', {
                data: {
                    type: 'create-calendar',
                    attributes: {
                        title
                    }
                }
            })

            await getCalendarsList()
            Notificator.success('Calendar created')
        } catch (error) {
            ErrorHandler.process(error)
        }

    }

    const deleteCalendar = async (id) => {
        await api.delete(`/calendars/${id}`)
    }

    const updateCalendar = async (id, title, status) => {
        try {
            const { data: { data } } = await api.patch(`/calendars/${id}`, {
                data: {
                    type: 'update-calendar',
                    attributes: {
                        title,
                        status
                    }
                }
            })

            Notificator.success('Calendar updated!')
        } catch (error) {
            ErrorHandler.process(error)
        }
    }

    const getCalendarUsers = async (id) => {
        try {
            const { data } = await api.get(`/calendars/${id}/users`)

            return data
        } catch (error) {
            ErrorHandler.process(error)
            return null
        }
    }

    const addUserToCalendar = async (id, role, email) => {
        try {
            const { data } = await api.post(`/calendars/${id}/users/${email}`, {
                data: {
                    type: 'calendar-user',
                    attributes: {
                        role
                    }
                }
            })

            return data;
        } catch (error) {
            ErrorHandler.process(error)
            return null
        }
    }

    const removeUserFromCalendar = async (calendarID, userID) => {
        await api.delete(`/calendars/${calendarID}/users/${userID}`)
    }

    const updateUserAtCalendar = async (calendarID, userID, role) => {
        try {
            const { data } = await api.patch(`/calendars/${calendarID}/users/${userID}`, {
                data: {
                    type: 'calendar-user',
                    attributes: {
                        role
                    }
                }
            })

            return data
        } catch (error) {
            ErrorHandler.process(error)
            return null
        }
    }

    const getCalendarsList = async (filter = null) => {
        setIsLoading(true)
        try {
            let URL = '/calendars?limit=10'

            if(filter) URL = URL.concat(`&filter[${filter.type}]=${filter.value}`)

            const { data } = await api.get(URL)

            setCalendars(data)

        } catch (error) {
            ErrorHandler.process(error)
        }
        setIsLoading(false)
    }

    const getCalendar = async (id) => {
        setIsLoading(true)
        try {
            const { data } = await api.get(`/calendars/${id}`)
            
            setIsLoading(false)
            return data
        } catch (error) {
            ErrorHandler.process(error)
            setIsLoading(false)
            return null
        }
    }

    //latitude and longtitude
    const getRegionEvents = async (year = new Date().getFullYear(), month = new Date().getMonth() + 1, day = null) => {
        const geoAllowed = async (position) => {
            const { latitude, longitude } = position.coords
            setIsLoading(true)
            try {
                let URL = `/calendars/region-events?lat=${latitude}&lng=${longitude}&year=${year}&month=${month}`

                if (day) URL = URL.concat(`&day=${day}`)

                const { data } = await api.get(URL)

                setRegionEvents(data)
            } catch (error) {
                ErrorHandler.process(error)
            }
            setIsLoading(false)
        }

        const geoRestricted = () => {
            Notificator.info('You wan`t be able to get region-events without geoposition')
        }


        window.navigator.geolocation.getCurrentPosition(geoAllowed, geoRestricted)
    }

    return {
        isLoading,
        calendars,
        regionEvents,
        createCalendar,
        deleteCalendar,
        updateCalendar,
        addUserToCalendar,
        removeUserFromCalendar,
        updateUserAtCalendar,
        getCalendarsList,
        getCalendar,
        getCalendarUsers,
        getRegionEvents
    }
}