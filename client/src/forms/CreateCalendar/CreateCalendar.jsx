import './CreateCalendar.scss'

import { useState } from 'react';
import { TextField, Button } from '@mui/material'
import { useForm, useFormValidation } from '@/hooks';
import { maxLength, minLength, ErrorHandler } from '@/helpers';

export default function CreateCalendar({ closeForm, createFunc }) {
    const [title, setTitle] = useState('')

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
            await createFunc(title)
            
            closeForm()
        } catch (error) {
            ErrorHandler.process(error)
        }
        enableForm()
    }

    return (
        <form className='create-calendar' onSubmit={submit}>
            <h1>Create calendar</h1>
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

            <section className='create-calendar__actions'>
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
                    Create
                </Button>
            </section>
        </form>
    )
}