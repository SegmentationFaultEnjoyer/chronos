import './EventsPage.scss'

import dayjs from 'dayjs';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom'

import { IconButton } from '@mui/material'
import {
    AddCircleOutline as AddIcon,
    DeleteForever as DeleteIcon,
    Task as TaskIcon,
    NotificationsActive as ReminderIcon,
    LocalLibrary as ArrangementIcon,
    EditOutlined as EditIcon,
    SouthAmerica as RegionIcon
} from '@mui/icons-material';
import { DotsLoader, Modal, ConfirmationModal } from '@/common';
import { useEvents, useUserInfo, useCalendar } from '@/hooks';
import { CreateEventForm, ChangeEventForm } from '@/forms';
import { EVENTS, ROLES } from '@/types';
import { useDidUpdateEffect } from '@/helpers';

export default function EventsPage() {
    const { date, id } = useParams()
    const navigate = useNavigate()

    const { events, isLoading, getEventsList, createEvent, deleteEvent, updateEvent } = useEvents(id)
    const { getUserInfo } = useUserInfo()

    const dateObj = dayjs(date)

    const { isLoading: isRegionLoading, regionEvents, getCalendarUsers, getRegionEvents } = useCalendar()

    const [isCreating, setIsCreating] = useState(false)
    const [isChanging, setIsChanging] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [eventToProcess, setEventToProcess] = useState({})

    const [users, setUsers] = useState(null)

    const createRef = useRef(null)
    const changeRef = useRef(null)

    const myAccount = useSelector(state => state.user.info)

    const isManager = useMemo(() => {
        const me = users?.data?.find(user => user.id === myAccount.id)

        if (!me) return false

        return me.attributes.role === ROLES.MANAGER
    }, [users, myAccount])

    const isAdmin = useMemo(() => {
        const me = users?.data?.find(user => user.id === myAccount.id)

        if (!me) return false

        return me.attributes.role === ROLES.ADMIN
    }, [users, myAccount])

    useEffect(() => {
        const initPage = async () => {
            await getUserInfo()
            await getEventsList({
                type: 'start',
                value: date.replace('+', 'Z')
            })
            await getRegionEvents(dateObj.year(), dateObj.month() + 1, dateObj.date())

            const data = await getCalendarUsers(id)

            setUsers(data)
        }
        initPage()
    }, [])

    useDidUpdateEffect(() => {
        if (events.length < 1) navigate(`/calendar/${id}`)
    }, [events])

    const handleEventDelete = () => {
        if (!eventToProcess.id) return

        deleteEvent(eventToProcess.id)
    }

    const handleDeleteClick = (event) => {
        setEventToProcess(event)
        setIsDeleting(true)
    }

    const handleChangeClick = (event) => {
        setEventToProcess(event)
        setIsChanging(true)
    }

    return (
        <>
            {(isLoading || isRegionLoading) ?
                <div className='events-page__loader'>
                    <DotsLoader />
                </div> :
                <div className='events-page'>
                    <section className='events-page__main'>
                        <header className='events-page__header'>
                            <h1>Events for </h1>
                            <p className='events-page__date'>{dateObj.format('YYYY MMM DD HH:mm')}</p>
                        </header>

                        <section className='events-page__events'>
                            {/* USER EVENTS */}
                            {events?.map(event =>
                                <div
                                    className='events-page__item'
                                    key={event.id}
                                >   
                                    {/* ACTIONS */}
                                    {(isAdmin || isManager) && 
                                    <div 
                                        className='events-page__label events-page__label--edit'
                                        onClick={() => handleChangeClick(event)}>
                                        <EditIcon color='primary_light' fontSize='small' />
                                    </div>}
                                    {(isAdmin || isManager) && 
                                    <div 
                                        className='events-page__label events-page__label--delete'
                                        onClick={() => handleDeleteClick(event)}
                                        >
                                        <DeleteIcon color='primary_light' fontSize='small' />
                                    </div>}

                                    <div className='events-page__header'>
                                        <div className='events-page__event-title'>
                                            <p>{event.attributes.title}</p>
                                            {event.attributes.type === EVENTS.TASK && <TaskIcon fontSize='small' />}
                                            {event.attributes.type === EVENTS.REMINDER && <ReminderIcon fontSize='small' />}
                                            {event.attributes.type === EVENTS.ARRANGEMENT && <ArrangementIcon fontSize='small' />}
                                        </div>

                                        <div
                                            className='events-page__color'
                                            style={{ backgroundColor: event.attributes.colour }} />
                                    </div>

                                    {event.attributes.description && <p>{event.attributes.description}</p>}

                                    {event.attributes.type === EVENTS.ARRANGEMENT &&
                                        <p>{`finishes: ${dayjs(event.attributes.finish).format('YYYY MMM DD HH:mm')}`}</p>}
                                </div>)}

                            {/* REGION EVENTS */}
                            { regionEvents?.data?.map(event => 
                                <div
                                className='events-page__item'
                                key={event.attributes.title}
                            >   
                                <div className='events-page__header'>
                                    <div className='events-page__event-title'>
                                        <p>{event.attributes.title}</p>
                                        <RegionIcon fontSize='small' />
                                    </div>
                                    <div
                                        className='events-page__color'
                                        style={{ backgroundColor: 'var(--primary-main)' }} />
                                </div>

                                <p>{event.attributes.description}</p>

                                <p>{dayjs(event.attributes.finish).format('YYYY MMM DD')}</p>
                            </div>
                                )}
                        </section>
                        {(isAdmin || isManager) &&
                        <IconButton onClick={() => setIsCreating(true)}>
                            <AddIcon fontSize='large' />
                        </IconButton> }
                    </section>
                    
                    <section className='events-page__side'>
                        <div className='events-page__instruction'>
                            <ArrangementIcon fontSize='small' />
                            <span> — arrangement </span>
                        </div>
                        <div className='events-page__instruction'>
                            <ReminderIcon fontSize='small' />
                            <span> — reminder </span>
                        </div>
                        <div className='events-page__instruction'>
                            <TaskIcon fontSize='small' />
                            <span> — task </span>
                        </div>
                        <div className='events-page__instruction'>
                            <RegionIcon fontSize='small' />
                            <span> — region event </span>
                        </div>
                    </section>
                </div>}

            {eventToProcess.id && 
            <ConfirmationModal 
                isOpen={isDeleting}
                setIsOpen={setIsDeleting}
                message={`${eventToProcess.attributes.title} has been deleted!`}
                action={ handleEventDelete }
            />}

            <Modal
                ref={createRef}
                isShown={isCreating}
                isCloseByClickOutside={false}
                setIsShown={setIsCreating}>
                <CreateEventForm
                    closeForm={() => setIsCreating(false)}
                    date={dateObj}
                    createCallback={createEvent} />
            </Modal>

            <Modal
                ref={changeRef}
                isShown={isChanging}
                isCloseByClickOutside={false}
                setIsShown={setIsChanging}>
                <ChangeEventForm
                    closeForm={() => setIsChanging(false)}
                    changeCallback={ updateEvent }
                    initData={ eventToProcess } />
            </Modal>
        </>
    )
}