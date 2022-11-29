import './UserPage.scss'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { useUserInfo, useCalendar } from '@/hooks'
import { AuthorAvatar, Month } from '@/components'
import { TriangleLoader, Modal } from '@/common'
import { ChangePasswordForm, ChangeEmailForm } from '@/forms'

import { Button, IconButton } from '@mui/material'
import {
    PhotoCamera as CameraIcon
} from '@mui/icons-material'
import { CALENDAR_TYPE } from '@/types'


export default function UserPage() {
    const { id } = useParams()

    const { loadUser, getUserInfo, changeAvatar } = useUserInfo()
    const { calendars, getCalendarsList } = useCalendar()

    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const navigate = useNavigate()

    const userID = useSelector(state => state.user.info.id)

    const isBelongToMe = useMemo(() => id === userID, [userID])

    const changePassRef = useRef(null)
    const changeEmailRef = useRef(null)
    const [isChangingPass, setIsChangingPass] = useState(false)
    const [isChangingEmail, setIsChangingEmail] = useState(false)

    useEffect(() => {
        const initPage = async () => {
            await getUserInfo()
            const resp = await loadUser(id)

            if(!resp) navigate('/main')

            await getCalendarsList({
                type: 'type',
                value: CALENDAR_TYPE.ADDITIONAL
            })

            setUser(resp.data.attributes)

            setIsLoading(false)
        }
        initPage()
    }, [id])

    const imageUpload = async (e) => {
        const formData = new FormData(e.target);
        await changeAvatar(formData)
        window.location.reload(false);
    }

    const uploadForm = useRef()

    const triggerForm = () => {
        uploadForm.current.dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true } )
        )
    }

    const toCalendarPage = (id) => {
        navigate(`/calendar/${id}`)
    }

    return (
        <div className='user-page'>
            {isLoading ?
                <div className='user-page__loader'>
                    <TriangleLoader />
                </div> :
                <div className='user-page__main'>
                    <div className='user-page__main-wrapper'>
                        <section className='user-page__user-info'>
                            <div
                                className='user-page__upload-trigger'>
                                <AuthorAvatar
                                    id={id}
                                    name={user.name}
                                    email={user.email}
                                    profile_picture={user.profile_picture}
                                    size={80}
                                    disableClick />
                            </div>
                            
                            {isBelongToMe &&
                                <form 
                                    className='user-page__upload-avatar' 
                                    onSubmit={ imageUpload } 
                                    ref={ uploadForm }>
                                    <IconButton 
                                        sx={{ color: 'var(--secondary-main)'}}
                                        aria-label="upload picture" 
                                        component="label">
                                        <input 
                                            hidden accept="image/*" 
                                            type="file" 
                                            name='img' 
                                            onChange={ triggerForm }/>
                                        <CameraIcon />
                                    </IconButton>
                                </form>}
                            <section className='user-info__header'>
                                <h1>{user.name}</h1>
                            </section>
                            <p>{user.email}</p>
                        </section>
                        {isBelongToMe && <section className='user-page__actions'>
                            <Button
                                variant='contained'
                                size="medium"
                                color="primary_light"
                                onClick={() => setIsChangingPass(true)}>
                                Change password
                            </Button>
                            <Button
                                variant='contained'
                                size="medium"
                                color="primary_light"
                                onClick={() => setIsChangingEmail(true)}>
                                Change info
                            </Button>
                        </section>}
                    </div>
                    <section className='user-page__calendars'>
                        {calendars.data.map(calendar => 
                        <Month 
                            onClick
                            key={ calendar.id }
                            callback={ () => toCalendarPage(calendar.id)}
                            title={ calendar.attributes.title }/>)}
                    </section>
                </div>}
            <Modal
                ref={changePassRef}
                isShown={isChangingPass}
                setIsShown={setIsChangingPass}>
                <ChangePasswordForm
                    closeModal={() => setIsChangingPass(false)}
                    userID={id} />
            </Modal>
            <Modal
                ref={changeEmailRef}
                isShown={isChangingEmail}
                setIsShown={setIsChangingEmail}>
                <ChangeEmailForm
                    closeModal={() => setIsChangingEmail(false) }
                    user={ user }
                    userID={ id } />
            </Modal>
        </div>
    )
}