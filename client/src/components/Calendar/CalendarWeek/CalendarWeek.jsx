import './CalendarWeek.scss'

import dayjs from 'dayjs';

import { useState, useCallback, useMemo, useRef, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

import { IconButton } from '@mui/material'
import { ChevronRight, ChevronLeft, History as RefreshIcon } from '@mui/icons-material'
import { WEEK_DAYS, MONTHS, TIME } from '@/consts'
import { CalendarContext } from '@/context';
import { weekGenerator, formatMonth, toISOString } from '@/helpers'
import { Modal } from '@/common';
import { useCalendar } from '@/hooks';
import { WEEK_TYPE } from '@/types'
import { CreateEventForm } from '@/forms';

export default function CalendarWeek({ info }) {
    const navigate = useNavigate()
    const id = info.id

    const { events, initDate: initialDate, isAdmin, isManager } = useContext(CalendarContext)

    const initDate = useMemo(() => initialDate ?? new Date(), [initialDate])

    const [currYear, setCurrYear] = useState(initDate.getFullYear())
    const [currMonth, setCurrMonth] = useState(initDate.getMonth())

    const initWeekValue = useMemo(() => weekGenerator(WEEK_TYPE.NEXT, initDate).next().value, [])

    const [currWeek, setCurrWeek] = useState(initWeekValue)
    const [event, setEvent] = useState({
        isCreating: false,
        date: null
    })

    const { regionEvents, getRegionEvents } = useCalendar()

    const createEventRef = useRef(null)

    useEffect(() => {
        getRegionEvents(currYear, currMonth + 1)
    }, [currYear, currMonth])

    const weekNext = useCallback(
        weekGenerator(
            WEEK_TYPE.NEXT,
            new Date(currWeek.at(-1).add(1, 'day').valueOf())),
        [currWeek]
    )
    const weekPrev = useCallback(
        weekGenerator(
            WEEK_TYPE.PREV,
            new Date(currWeek.at(0).subtract(1, 'day').valueOf())),
        [currWeek]
    )

    const setMonth = (action) => {
        const month = action === 'inc' ? currMonth + 1 : currMonth - 1;

        if (month > 11 || month < 0) {
            const [year, newMonth] = formatMonth(currYear, month)
            setCurrYear(year)
            setCurrMonth(newMonth)
            return
        }

        setCurrMonth(month)
    }

    const hasMonthTransition = (week) => 
        (week.at(0).get('date') in new Array(8).fill(0).map((_, i) => i + 1))
    
    const handleWeekChange = (nextWeek, type = 'inc') => {
        switch (type) {
            case 'inc':
                if (hasMonthTransition(nextWeek)) {
                    setMonth(type)
                }
                break;
            case 'dec':
                if (hasMonthTransition(currWeek)) {
                    setMonth(type)
                }
                break;
            default:
                break;
        }

        setCurrWeek(nextWeek)
    }

    const handleTimeClick = (time, day) => {
        const [hour] = time.split(':')

        for (let event of regionEvents.data)
            if (hasRegionEvent(day, event)) {
                navigate(`/calendar/${id}/${toISOString(day.hour(hour).toDate())}/events`)
                return
            }
        
        day = day.hour(hour)

        for (let event of events)
            if (hasEvent(time, day, event, true)) {
                navigate(`/calendar/${id}/${toISOString(day.toDate())}/events`)
                return
            }

        if (day.isBefore(Date.now())) return
        if(!isAdmin && !isManager) return

        setEvent({
            isCreating: true,
            date: day
        })
    }

    const hasEvent = (time, day, event, startOnly = false) => {
        const [hour] = time.split(':')
        day = day.hour(hour)

        if (!events.length) return false

        const eventFinish = dayjs(event.attributes.finish)
        const eventStart = dayjs(event.attributes.start)

        if (startOnly) return eventStart.isSame(day)

        return eventFinish.isSame(day) || eventStart.isSame(day)
    }

    const hasRegionEvent = (day, event) => {
        if (!regionEvents.data) return false

        const eventFinish = dayjs(event.attributes.finish)

        return eventFinish.isSame(day)
    }

    const setIsCreatingEvent = (value) => {
        setEvent(prev => ({
            ...prev, isCreating: value
        }))
    }

    const reset = () => {
        setCurrWeek(weekGenerator().next().value)
        setCurrMonth(new Date().getMonth())
        setCurrYear(new Date().getFullYear())
    }

    return (
        <div className='calendar-week'>
            <header className='calendar-week__header'>
                <div className='calendar-week__info'>
                    <h1 className='calendar-week__title'>{MONTHS[currMonth]}</h1>
                    <h2>{currYear}</h2>
                    <h2>{`week ${currWeek.at(-1).isoWeek()}`}</h2>
                    <IconButton onClick={ reset }>
                        <RefreshIcon />
                    </IconButton>
                </div>
                <div className='calendar-week__pages'>
                    <IconButton onClick={() => handleWeekChange(weekPrev.next().value, 'dec')}>
                        <ChevronLeft />
                    </IconButton>
                    <IconButton onClick={() => handleWeekChange(weekNext.next().value)}>
                        <ChevronRight />
                    </IconButton>
                </div>
               
            </header>
            <section className='calendar-week__content'>
                <ul className='calendar-week__week-days'>
                    <li className='calendar-week__day' />
                    {currWeek.map((day, i) =>
                        <li
                            className={
                                day.isSame(dayjs(new Date()), 'day') ?
                                    'calendar-week__day calendar-week__day--today' :
                                    'calendar-week__day'}
                            key={day.format()}>
                            <p>{WEEK_DAYS[i]}</p>
                            <p>{day.get('date')}</p>
                        </li>)}
                </ul>
                <section className='calendar-week__schedule'>
                    {TIME.map(time =>
                        <ul className='calendar-week__time' key={time}>
                            <li className='calendar-week__time-pick'>{time}</li>
                            {new Array(7).fill('').map((_, i) =>
                                <li
                                    onClick={() => handleTimeClick(time, currWeek[i])}
                                    key={currWeek[i].format()}
                                    className='calendar-week__time-pick calendar-week__time-pick--clickable'>
                                    {
                                        events?.map(event => hasEvent(time, currWeek[i], event) &&
                                        <div 
                                            className='calendar-week__event' 
                                            key={event.id} 
                                            style={{backgroundColor: event.attributes.colour}}>
                                           <span>{event.attributes.title}</span>
                                        </div>)
                                    }
                                    {
                                        regionEvents?.data?.map(event => hasRegionEvent(currWeek[i], event) && 
                                        <div 
                                            className='calendar-week__event' 
                                            key={event.attributes.title} 
                                            style={{backgroundColor: 'var(--primary-main)'}}>
                                           <span>{event.attributes.title}</span>
                                        </div>)
                                    }
                                </li>)}
                        </ul>)}
                </section>
            </section>
            <div className='calendar-week__empty' />

            <Modal
                isCloseByClickOutside={false}
                ref={createEventRef}
                isShown={event.isCreating}
                setIsShown={setIsCreatingEvent}>
                <CreateEventForm
                    closeForm={() => setIsCreatingEvent(false)}
                    date={event.date} />
            </Modal>
        </div>
    )
}