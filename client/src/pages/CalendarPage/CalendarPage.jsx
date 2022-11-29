import './CalendarPage.scss'

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { TriangleLoader } from '@/common'
import { Calendar } from '@/components'
import { useCalendar, useUserInfo } from '@/hooks'


export default function CalendarPage() {
    const { id } = useParams()

    const { getCalendar, isLoading } = useCalendar()
    const { getUserInfo } = useUserInfo()

    const [info, setInfo] = useState({})

    const user = useSelector(state => state.user.info)

    useEffect(() => {
        const initPage = async () => {
            if (!user.id) await getUserInfo()

            const { data } = await getCalendar(id)

            setInfo(data)
        }
        initPage()
    }, [])

    return (
        <>
        { isLoading ? 
        <div className='calendar-page__loader'><TriangleLoader /></div> :
        <div className='calendar-page'>
            <Calendar info={ info }/>
        </div>
        }
       
        </>
    )
}