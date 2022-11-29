import './NavBar.scss';

import Clock from 'react-digital-clock';

import {
    Logout as LogoutIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminPanel,
    CalendarMonth
} from '@mui/icons-material'

import { api } from '@/api';
import { useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ErrorHandler } from '@/helpers';
import { Notificator } from '@/common';
import { ROLES, ROUTES } from '@/types'

import { io } from "socket.io-client";

export default function NavBar() {
    const navigate = useNavigate();
    const location = useLocation()

    const userID = useSelector(state => state.user.info.id)
    const isAdmin = useSelector(state => state.user.info.role === ROLES.ADMIN)
    const isShown = useMemo(() => location.pathname !== ROUTES.LOGIN, [location.pathname])

    const logOut = async () => {
        try {
            await api.get('/auth/logout');

        } catch (error) {
            ErrorHandler.process(new Error('Your token expired, but anyway you leaving:)'));
            ErrorHandler.clearTokens();
        }

        navigate('/');
    }

    const toHomePage = () => {
        navigate('/main');
    }

    const toUserPage = () => {
        navigate(`/user/${userID}`)
    }

    const toCalendarPage = () => {
        navigate(`/calendars`)
    }

    const toAdminPage = () => {
        navigate('/admin')
    }

    useEffect(() => {
        if (!userID) return

        const socket = io('http://localhost:8088', {
            auth: {
                id: userID
            }
        });

        socket.on("connect", async () => {
            console.log('socket connection established', userID);
        })

        socket.on("notification", async (data) => {
            Notificator.info(data)
        })

    }, [userID])

    return (
        <>
            {isShown &&
                <nav className='nav-bar'>
                    <div className='nav-bar__header'>
                        <h1 className='nav-bar__logo' onClick={toHomePage}>CHRONOS</h1>
                        <Clock hour12={false} />
                    </div>
                    <section className='nav-bar__actions'>
                        {isAdmin && <div className='nav-bar__icon' onClick={toAdminPage}>
                            <AdminPanel color='tertiary_main' />
                        </div>}
                        <div className='nav-bar__icon' onClick={toCalendarPage}>
                            <CalendarMonth color='tertiary_main' />
                        </div>
                        <div className='nav-bar__icon' onClick={toUserPage}>
                            <PersonIcon color='tertiary_main' />
                        </div>
                        <div className='nav-bar__icon' onClick={logOut}>
                            <LogoutIcon color='tertiary_main' />
                        </div>
                    </section>
                </nav>}
        </>
    )
}