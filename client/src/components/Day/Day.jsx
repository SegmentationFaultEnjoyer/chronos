import dayjs from 'dayjs'
import { useMemo } from 'react'
import './Day.scss'

export default function Day({ dayInfo, isActive, small, color = '', clickCallback = () => {} }) {
    const classList = useMemo(() => {
        let defClasses = ['day']

        if (!isActive) defClasses.push('day--inactive')
        if (dayInfo.isSame(dayjs(new Date()), 'day')) defClasses.push('day--today')
        if (small) defClasses.push('day--small')

        return defClasses.concat(`day--color-${color}`).join(' ')
    })

    return (
    <li className={ classList } onClick={ clickCallback }>
        { dayInfo.get('date') }
    </li>)
}