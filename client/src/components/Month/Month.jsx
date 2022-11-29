import './Month.scss'

import { useMemo } from 'react'
import { Day } from '@/components'
import { getDaysInMonth } from '@/helpers'

export default function Month({ title, callback, currYear, hidden }) {
    const year = currYear ?? new Date().getFullYear()
    const days = useMemo(() => getDaysInMonth(year, 0), [year])

    const classes = useMemo(() => {
        let defaultClasses = ['month']

        if (hidden) defaultClasses.push('month--hidden')

        return defaultClasses.join(' ')
    }, [])

    return (
        <div
            className={classes}
            onClick={ callback ? callback : () => {}}>
            <p className='month__title'>{title}</p>
            <ul className='month__days'>
                {days.map(day =>
                    <Day
                        small
                        color='secondary'
                        key={day.format()}
                        dayInfo={day}
                        isActive={day.get('month') === 0} />)}
            </ul>
        </div>
    )
}