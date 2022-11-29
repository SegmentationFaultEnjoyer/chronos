import './CreateEvent.scss'

import { useState, useContext } from 'react';
import { SketchPicker } from 'react-color';

import { TextField, Button } from '@mui/material'

import { useForm, useFormValidation } from '@/hooks';
import { maxLength, minLength, ErrorHandler, toISOString } from '@/helpers';
import { SingleSelect, DateTimePicker } from '@/fields';
import { CalendarContext } from '@/context';

import { EVENTS } from '@/types';


export default function CreateEvent({ closeForm, date, createCallback }) {
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('')
    const [category, setCategory] = useState('')
    const [finish, setFinish] = useState(date)
    const [color, setColor] = useState('#116021')

    let createEvent

    const context = useContext(CalendarContext)
    if (context)  createEvent = context.createEvent
    else createEvent = createCallback
       
    const { isFormDisabled, disableForm, enableForm } = useForm();
    const { isFormValid, getFieldErrorMessage, touchField } = useFormValidation(
        { title },
        {
            title: { minLength: minLength(4), maxLength: maxLength(32) },
        },
    )
        
    const submit = async (e) => {
        e.preventDefault()
        
        if (!isFormValid()) return
        
        disableForm()
        try {
            await createEvent(title, desc, toISOString(date.toDate()), toISOString(finish.toDate()), color, category )
            closeForm()
        } catch (error) {
            ErrorHandler.process(error)
        }
        enableForm()
    }

    return (
        <form className='create-event' onSubmit={submit}>
            <h1>Create event</h1>
            <p>{date.format('DD MMM YYYY HH:mm')}</p>
            <section className='create-event__inputs'>
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
                <SingleSelect
                    value={category}
                    setValue={setCategory}
                    label='Type'
                    size='large'
                    choices={Array.from(Object.values(EVENTS))} />
                {category === EVENTS.ARRANGEMENT && 
                <DateTimePicker 
                    label='finish'
                    value={finish}
                    minDateTime={ date }
                    setValue={setFinish}/>
                }
                <p>Event color</p>
                <SketchPicker 
                    color={color}
                    onChangeComplete={(color) => setColor(color.hex)}/>
            </section>
            
            <section className='create-event__actions'>
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
                    Create event
                </Button>
            </section>
        </form>
    )
}