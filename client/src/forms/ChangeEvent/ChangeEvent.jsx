import './ChangeEvent.scss'

import dayjs from 'dayjs';
import { useState } from 'react';
import { SketchPicker } from 'react-color';

import { TextField, Button, } from '@mui/material'

import { useForm, useFormValidation } from '@/hooks';
import { maxLength, minLength, ErrorHandler, toISOString } from '@/helpers';
import { DateTimePicker } from '@/fields';

import { EVENTS } from '@/types';

import { Notificator } from '@/common';


export default function ChangeEvent({ closeForm, initData, changeCallback }) {
    const [title, setTitle] = useState(initData.attributes.title)
    const [desc, setDesc] = useState(initData.attributes.description)
    const [start, setStart] = useState(dayjs(initData.attributes.start))
    const [finish, setFinish] = useState(dayjs(initData.attributes.finish))
    const [color, setColor] = useState(initData.attributes.colour)

    const { isFormDisabled, disableForm, enableForm } = useForm();
    const { isFormValid, getFieldErrorMessage, touchField } = useFormValidation(
        { title },
        {
            title: { minLength: minLength(4), maxLength: maxLength(32) },
        },
    )

    const setStartDate = (date) => {
        setStart(date)

        if (date.isAfter(finish))
            setFinish(date)
    }
        
    const submit = async (e) => {
        e.preventDefault()
        
        if (!isFormValid()) return
        
        disableForm()
        try {
            await changeCallback(initData.id, {
                title,
                description: desc,
                start: toISOString(start.toDate()),
                finish: toISOString(finish.toDate()),
                colour: color
            })

            Notificator.success('Event updated!')
            
            closeForm()
        } catch (error) {
            ErrorHandler.process(error)
        }
        enableForm()
    }

    return (
        <form className='change-event' onSubmit={submit}>
            <h1>Change event</h1>
            <section className='change-event__inputs'>
                <TextField
                    fullWidth
                    variant='outlined' label='Enter title'
                    color="primary_light"
                    value={title}
                    onChange={e => { setTitle(e.target.value) }}
                    onBlur={() => touchField('title')}
                    disabled={isFormDisabled}
                    error={getFieldErrorMessage('title') !== ''}
                    helperText={getFieldErrorMessage('title')}
                    required />
                <TextField
                    multiline
                    fullWidth
                    variant='outlined' label='Event details'
                    color="primary_light"
                    value={desc}
                    onChange={e => { setDesc(e.target.value) }}
                    disabled={isFormDisabled}
                />
                <DateTimePicker 
                    label='start'
                    value={start}
                    minDateTime={ dayjs() }
                    setValue={setStartDate}/>
                
                {initData.attributes.type === EVENTS.ARRANGEMENT && 
                <DateTimePicker 
                    label='finish'
                    value={finish}
                    minDateTime={ start }
                    setValue={setFinish}/>
                }
                <p>Event color</p>
                <SketchPicker 
                    color={color}
                    onChangeComplete={(color) => setColor(color.hex)}/>
            </section>
            
            <section className='change-event__actions'>
                <Button
                    variant='contained'
                    type='reset'
                    size="large"
                    color="primary_main"
                    disabled={isFormDisabled}
                    onClick={closeForm}>
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    type='submit'
                    size="large"
                    color="primary_light"
                    disabled={isFormDisabled}>
                    Change event
                </Button>
            </section>
        </form>
    )
}