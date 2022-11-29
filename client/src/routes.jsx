import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ROUTES } from '@/types';

export default function AppRoutes() {
    const LoginPage = lazy(() => import('@/pages/LoginPage/LoginPage.jsx'));
    const MainPage = lazy(() => import('@/pages/MainPage/MainPage.jsx'));
    const ErrorPage = lazy(() => import('@/pages/ErrorPage/ErrorPage.jsx'));
    const ResetPage = lazy(() => import('@/pages/ResetPasswordPage/ResetPassword.jsx'));
    const UserPage = lazy(() => import('@/pages/UserPage/UserPage.jsx'))
    const CalendarsPage = lazy(() => import('@/pages/CalendarsPage/CalendarsPage.jsx'))
    const CalendarPage = lazy(() => import('@/pages/CalendarPage/CalendarPage.jsx'))
    const EventsPage = lazy(() => import('@/pages/EventsPage/EventsPage.jsx'))

    const location = useLocation();
    
    return (
        <Suspense fallback={<></>}>
            <AnimatePresence mode='wait'>
                <Routes location={location} key={location.pathname}>
                    <Route path={ROUTES.LOGIN} element={
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}>
                            <LoginPage />
                        </motion.div>
                    } />
                    <Route path={ROUTES.MAIN} element={
                        <motion.div 
                            initial={{ opacity: 0}}
                            animate={{ opacity: 1}}
                            exit={{ opacity: 0}}>
                            <MainPage />
                        </motion.div>
                    } />
                    <Route path={ROUTES.CALENDARS} element={
                        <motion.div 
                            initial={{ opacity: 0}}
                            animate={{ opacity: 1}}
                            exit={{ opacity: 0}}>
                            <CalendarsPage />
                        </motion.div>
                    } />
                    <Route path={ROUTES.CALENDAR} element={
                        <motion.div 
                            initial={{ opacity: 0}}
                            animate={{ opacity: 1}}
                            exit={{ opacity: 0}}>
                            <CalendarPage />
                        </motion.div>
                    } />
                    <Route path={ROUTES.EVENTS} element={ 
                            <motion.div 
                                initial={{ opacity: 0}}
                                animate={{ opacity: 1}}
                                exit={{ opacity: 0}}>
                                <EventsPage />
                            </motion.div>
                         }/>
                    <Route path={ROUTES.USER} element={
                        <motion.div 
                            initial={{ opacity: 0}}
                            animate={{ opacity: 1}}
                            exit={{ opacity: 0}}>
                            <UserPage />
                        </motion.div>
                    } />
                    <Route path={ROUTES.RESET} element={
                        <motion.div 
                            initial={{ opacity: 0}}
                            animate={{ opacity: 1}}
                            exit={{ opacity: 0}}>
                            <ResetPage />
                        </motion.div>
                    } />
                    <Route path={ROUTES.ANY} element={
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1}}
                            exit={{ opacity: 0}}>
                            <ErrorPage />
                        </motion.div>
                    } />
                </Routes>
            </AnimatePresence>
        </Suspense>
    )
}