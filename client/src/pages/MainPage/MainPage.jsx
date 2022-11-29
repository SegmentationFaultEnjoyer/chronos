import './MainPage.scss';

import { useEffect } from 'react';
import CookieConsent from 'react-cookie-consent';

import { useUserInfo, useCalendar } from '@/hooks';
import { TriangleLoader } from '@/common';

import { Calendar } from '@/components';
import { CALENDAR_TYPE } from '@/types';

export default function MainPage() {
    const { getUserInfo } = useUserInfo();
    const { calendars, isLoading, getCalendarsList } = useCalendar()
   
    useEffect(() => { 
        const initPage = async () => {
            await getUserInfo()
            await getCalendarsList({
                type: 'type',
                value: CALENDAR_TYPE.MAIN
            })
        }

        initPage()
     }, []);

    return (
        <section className="main-page">
            {isLoading ? 
            <div className="main-page__loader-container">
                <p>Loading...</p>
                <TriangleLoader /> 
            </div>
        : 
            <>
                <Calendar info={ calendars?.data?.at(0) }/>
                <CookieConsent
                    containerClasses='slide-top'
                    style={{ background: "var(--primary-main)" }}
                    buttonStyle={{ 
                        backgroundColor: "var(--secondary-main)", 
                        color: "var(--tertiary-main)",
                        borderRadius: "5px" }}>
                    This website uses cookies to enhance the user experience.
                </CookieConsent>
            </>}
        </section>
    )
}