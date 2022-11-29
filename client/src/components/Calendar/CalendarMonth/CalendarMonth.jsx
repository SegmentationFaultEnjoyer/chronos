import './CalendarMonth.scss'

import { useMemo, useState } from 'react'
import { Day } from '@/components'
import { IconButton } from '@mui/material'
import { ChevronRight, ChevronLeft } from '@mui/icons-material'
import { getDaysInMonth, formatMonth } from '@/helpers'
import { WEEK_DAYS, MONTHS } from '@/consts'

export default function CalendarMonth({ datePicker, events }) {
    const today = new Date()
    const [currYear, setCurrYear] = useState(today.getFullYear())
    const [currMonth, setCurrMonth] = useState(today.getMonth())

    const days = useMemo(() => getDaysInMonth(currYear, currMonth), [currYear, currMonth])

    const setMonth = (action) => {
        const month = action === 'inc' ? currMonth + 1 : currMonth - 1;

        if(month > 11 || month < 0) {
            const [year, newMonth] = formatMonth(currYear, month)
            setCurrYear(year)
            setCurrMonth(newMonth)
            return
        }

        setCurrMonth(month)
    }

    return (
        <div className='calendar-month'>
            <section className='calendar-month__header'>
                <h3>{ MONTHS[currMonth] }</h3>
                <h3>{ currYear }</h3>
                <section className='calendar-month__pages'>
                    <IconButton onClick={() => setMonth('dec')}>
                        <ChevronLeft />
                    </IconButton>
                    <IconButton onClick={() => setMonth('inc')}>
                        <ChevronRight />
                    </IconButton>
            </section>
            </section>
           
            
            <ul className='calendar-month__week'>
                {WEEK_DAYS.map(day => 
                    <li className='calendar-month__week-day' key={ day }>{ day }</li>)}
            </ul>
            <ul className='calendar-month__days'>
                {days.map(day => 
                <Day 
                    clickCallback={ () => datePicker(day.toDate()) }
                    dayInfo={ day } 
                    isActive={ day.get('month') === currMonth }
                    key={ day.format() }/>
               )}
            </ul>
        </div>
    )
}