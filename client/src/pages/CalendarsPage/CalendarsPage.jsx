import './CalendarsPage.scss'

import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button } from '@mui/material'
import { NotificationAdd } from '@mui/icons-material'

import { Modal, TriangleLoader } from '@/common'
import { CreateCalendarForm } from '@/forms'
import { Month } from '@/components'
import { useCalendar, useUserInfo } from '@/hooks'
import { CALENDAR_TYPE } from '@/types'


export default function CalendarsPage() {
    const user = useSelector(state => state.user.info)

    const navigate = useNavigate()
    const { isLoading, calendars, getCalendarsList, createCalendar } = useCalendar()
    const { getUserInfo } = useUserInfo()

    const modalRef = useRef(null)
    const [isModalShown, setIsModalShown] = useState(false)

    const toMainCalendar = () => {
        navigate('/main')
    }

    const toOtherCalendar = (id) => {
        navigate(`/calendar/${id}`)
    }

    useEffect(() => { 
        const initPage = async () => {
            if(!user.id) await getUserInfo()

            await getCalendarsList()
        }
        initPage()
    }, [])

    return (
        <>
            {isLoading ?
                <div className='calendars-page__loader'><TriangleLoader /></div> :
                <div className='calendars-page'>
                    <section className='calendars-page__header'>
                        <h1>Here is your calendars</h1>
                        <Button
                            variant='contained'
                            size="large"
                            endIcon={<NotificationAdd />}
                            color="primary_light"
                            onClick={() => setIsModalShown(true)}>
                            Create Calendar
                        </Button>
                    </section>
                    <section className='calendars-page__calendars'>
                        {calendars?.data?.map(calendar =>
                            <Month 
                                hidden={ !calendar.attributes.status }
                                key={calendar.id}
                                title={calendar.attributes.title}
                                callback={calendar.attributes.type === CALENDAR_TYPE.MAIN ? 
                                    toMainCalendar
                                    : () => toOtherCalendar(calendar.id)}/>
                            )}
                    </section>
                </div>
            }

            <Modal
                ref={modalRef}
                isShown={isModalShown}
                setIsShown={setIsModalShown}>
                <CreateCalendarForm 
                    createFunc={ createCalendar }
                    closeForm={() => setIsModalShown(false)} />
            </Modal>
        </>

    )
}