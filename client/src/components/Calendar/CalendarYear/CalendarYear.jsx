import './CalendarYear.scss'

import { useState } from 'react'
import { getDaysInMonth, formatMonth } from '@/helpers'
import { MONTHS } from '@/consts'
import { Day } from '@/components'
import { IconButton } from '@mui/material'
import { ChevronRight, ChevronLeft } from '@mui/icons-material'

export default function CalendarYear({ datePicker, events }) {
    const today = new Date()
    const [currYear, setCurrYear] = useState(today.getFullYear())

    return (
        <div className='calendar-year__container'>
            <section className='calendar-year__pages'>
                <IconButton onClick={ () => setCurrYear(prev => prev - 1) }>
                    <ChevronLeft />
                </IconButton>
                <h1>{ currYear }</h1>
                <IconButton onClick={ () => setCurrYear(prev => prev + 1) }>
                    <ChevronRight/>
                </IconButton>
            </section>
            <div className='calendar-year'>
                { MONTHS.map((month, i) => 
                    <div className='calendar-year__month' key={ month }>
                        <p className='calendar-year__month-title'>{ month }</p>
                        <ul className='calendar-year__days'>
                            { getDaysInMonth(currYear, i).map(day => 
                                <Day 
                                    small
                                    clickCallback={ () => datePicker(day.toDate()) }
                                    color='secondary'
                                    key={ day.format() }
                                    dayInfo={ day }
                                    isActive={ day.get('month') === i }/>)}
                        </ul>
                    </div>
                    )}
            </div>
        </div>
    )
}