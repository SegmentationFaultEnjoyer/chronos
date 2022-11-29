import './Calendar.scss'

import dayjs from 'dayjs'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { 
    CalendarMonth, 
    CalendarYear, 
    CalendarWeek,
    CalendarUsers 
} from '@/components/Calendar'
import { AuthorAvatar } from '@/components'
import { IconButton, Button } from '@mui/material'
import {
    CalendarMonth as MonthIcon,
    Apps as YearIcon,
    DateRange as WeekIcon,
    DeleteOutline as DeleteIcon,
    Edit as EditIcon,
} from '@mui/icons-material'
import { CALENDAR_MODE, CALENDAR_TYPE, ROLES, ROUTES } from '@/types'
import { useEvents, useCalendar, useForm } from '@/hooks'
import { ChangeCalendarForm } from '@/forms'
import { TriangleLoader, ConfirmationModal, Modal } from '@/common'
import { CalendarContext } from '@/context'

export default function Calendar({ info }) {
    const navigate = useNavigate()

    const [calendarMode, setCalendarMode] = useState(CALENDAR_MODE.WEEK)
    const [initDate, setInitDate] = useState(new Date())
    const [isDeleting, setIsDeleting] = useState(false)

    const [isEditing, setIsEditing] = useState(false)

    const editRef = useRef(null)

    const [title, setTitle] = useState(info?.attributes?.title)
    const { author } = info?.relationships

    const myAccount = useSelector(state => state.user.info)
    const [users, setUsers] = useState([])
    
    const isMain = useMemo(() => info.attributes.type === CALENDAR_TYPE.MAIN, [info])

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

    const { events, isLoading, getEventsList, createEvent } = useEvents(info.id)
    const { isFormDisabled, disableForm, enableForm } = useForm()
    const { 
        deleteCalendar, 
        updateCalendar, 
        getCalendarUsers
    } = useCalendar()

    useEffect(() => {
        const initCalendar = async () => {
            const data = await getCalendarUsers(info.id)

            setUsers(data)
            await getEventsList()
        }
        initCalendar()
    }, [])

    const datePicker = (date) => {
        setInitDate(date)
        setCalendarMode(CALENDAR_MODE.WEEK)

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        })
    }

    const deleteCal = async () => {
        disableForm()
        await deleteCalendar(info.id)
        enableForm()

        navigate(ROUTES.CALENDARS)
    }

    const updateCal = async (title, status) => {
        disableForm()
        await updateCalendar(info.id, title, status)
        enableForm()

        setTitle(title)
    }

    return (
        <>
        {isLoading ? <div className='calendar__loader'><TriangleLoader /></div> :
        <div className='calendar'>
        {/* HEADER */}
            <section className='calendar__header'>
                <div className='calendar__header-item'>
                    <AuthorAvatar 
                        id={ author.id  }
                        name={ author.name }
                        email={ author.email }
                        />
                    <p className='calendar__author'>{ author.name }</p>
                </div>
                <div className='calendar__header-item'>
                    <h1>{ title }</h1>
                    <p className='calendar__created-at'>
                        { dayjs(info.attributes.created_at).format('DD/MM/YYYY hh:mm')  }
                    </p>
                </div>

                { isAdmin && !isMain && 
                <section className='calendar__actions'>
                    <Button
                        variant='contained'
                        type='reset'
                        size="medium"
                        color="primary_light"
                        endIcon={ <EditIcon /> }
                        onClick={() => setIsEditing(true)}
                        disabled={ isFormDisabled }
                        >
                        Edit
                    </Button>
                    <Button
                        variant='contained'
                        type='reset'
                        size="medium"
                        color="primary_light"
                        endIcon={ <DeleteIcon /> }
                        onClick={() => setIsDeleting(true)}
                        disabled={ isFormDisabled }
                        >
                        Delete
                    </Button>
                </section>}
            </section>
            <CalendarContext.Provider value={ 
                {
                    createEvent, 
                    events, 
                    initDate, 
                    isAdmin, 
                    isManager, 
                    myAccount} 
                }>
                <CalendarUsers info={info} users={users} setUsers={setUsers}/>
            
                {/* CALENDAR MODE */}
                <div className='calendar__mode'>
                    <div className='calendar__mode-container'>
                        <p>Week</p>
                        <IconButton onClick={() => setCalendarMode(CALENDAR_MODE.WEEK)}>
                            <WeekIcon color='primary_light' />
                        </IconButton>
                    </div>
                    <div className='calendar__mode-container'>
                        <p>Month</p>
                        <IconButton onClick={() => setCalendarMode(CALENDAR_MODE.MONTH)}>
                            <MonthIcon color='primary_light' />
                        </IconButton>
                    </div>
                    <div className='calendar__mode-container'>
                        <p>Year</p>
                        <IconButton onClick={() => setCalendarMode(CALENDAR_MODE.YEAR)}>
                            <YearIcon color='primary_light' />
                        </IconButton>
                    </div>
                    
                </div>

                {/* RENDERING CALENDARS */}
            
                <section className='calendar__main'>
                    {calendarMode === CALENDAR_MODE.WEEK && <CalendarWeek info={ info }/>}
                    {calendarMode === CALENDAR_MODE.MONTH &&  
                        <CalendarMonth 
                            datePicker={ datePicker }/>}
                    {calendarMode === CALENDAR_MODE.YEAR && 
                        <CalendarYear 
                            datePicker={ datePicker } />}
                </section>
            </CalendarContext.Provider>
        </div>}
                    
        {/* DELETE CALENDAR */}
        <ConfirmationModal 
            isOpen={ isDeleting }
            setIsOpen={ setIsDeleting }
            action={ deleteCal }
            message={ `Calendar ${info.attributes.title} deleted!` }/>

        {/* UPDATE CALENDAR */}
        <Modal 
            ref={editRef}
            isShown={isEditing}
            setIsShown={setIsEditing}>
            <ChangeCalendarForm 
                closeForm={() => setIsEditing(false)}
                updateFunc={ updateCal }
                info={ info }/>
        </Modal>
        </>

       
    )
}

