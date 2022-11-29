import { WEEK_TYPE } from '@/types';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

export function formatDate(date) {
    const days = dayjs(Date.now()).diff(date, 'days')

    if (!days) return 'today'

    if (days <= 31)
        return `${days} ${days > 1 ? 'days' : 'day'} ago`

    const months = dayjs(Date.now()).diff(date, 'months')

    if (months <= 12)
        return `more than ${months} months ago`

    const years = dayjs(Date.now()).diff(date, 'years')

    return `more than ${years} years ago`
}

export function formatMonth(currYear, month) {
    const date = new Date(currYear, month)
    return [date.getFullYear(), date.getMonth()]
}


//first call will give you current week
export function* weekGenerator(type = WEEK_TYPE.NEXT, day = new Date()) {
    const WEEK_LENGHT = 7;
    const currYear = day.getFullYear()
    const currMonth = day.getMonth()

    // console.log('init day', day, currYear, currMonth);

    while (true) {
        const dayOfWeek = day.getDay()
        const date = day.getDate()

        const days = []

        for (let i = dayOfWeek; i > 0; i--) {
            days.push(dayjs(new Date(currYear, currMonth, date - i)))
        }

        days.push(dayjs(new Date(currYear, currMonth, date)))

        const daysLength = days.length

        for (let i = 0; i < WEEK_LENGHT - daysLength; i++) {
            days.push(dayjs(new Date(currYear, currMonth, date + i + 1)))
        }

        if (type === WEEK_TYPE.NEXT)
            day = new Date(currYear, currMonth, days.at(-1).add(1, 'day').get('date'));
        
        if (type === WEEK_TYPE.PREV)
            day = new Date(currYear, currMonth, days.at(0).subtract(1, 'day').get('date'));

        // let log = days.map(day => day.format('DD/MM/YYYY')).join(' ')
        // console.log(type, log);

        yield days;
    }

}

export function getDaysInMonth(currYear, currMonth) {
    const firstDayOfMonth = new Date(currYear, currMonth, 1).getDay()
    const lastDateOfMonth = new Date(currYear, currMonth + 1, 0).getDate()
    const lastDayOfMonth = new Date(currYear, currMonth, lastDateOfMonth).getDay()
    const lastDateOfLastMonth = new Date(currYear, currMonth, 0).getDate()

    const days = []
    let date;

    const [nextMonthYear, nextMonth] = formatMonth(currYear, currMonth + 1)
    const [prevMonthYear, prevMonth] = formatMonth(currYear, currMonth - 1)

    //days from last month
    for (let i = firstDayOfMonth; i > 0; i--) {
        date = dayjs(new Date(prevMonthYear, prevMonth, lastDateOfLastMonth - i + 1))
        days.push(date)
    }

    //days from this month
    for (let i = 1; i <= lastDateOfMonth; i++) {
        date = dayjs(new Date(currYear, currMonth, i))
        days.push(date)
    }

    //days from next month
    for (let i = lastDayOfMonth; i < 6; i++) {
        date = dayjs(new Date(nextMonthYear, nextMonth, i - lastDayOfMonth + 1))
        days.push(date)
    }

    return days
}

export function toISOString(date) {
    const tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function(num) {
          return (num < 10 ? '0' : '') + num;
      };

  return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      dif + pad(Math.floor(Math.abs(tzo) / 60)) +
      ':' + pad(Math.abs(tzo) % 60);
}