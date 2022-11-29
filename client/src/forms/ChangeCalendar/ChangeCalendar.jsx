import './ChangeCalendar.scss'

import { useState } from 'react';
import { TextField, Button, Checkbox } from '@mui/material'
import { useForm, useFormValidation } from '@/hooks';
import { SwitchIOS } from '@/common'
import { maxLength, minLength, ErrorHandler } from '@/helpers';

export default function ChangeCalendar({ closeForm, updateFunc, info }) {
    const [title, setTitle] = useState(info.attributes.title)
    const [status, setStatus] = useState(info.attributes.status)

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
            await updateFunc(title, status)
            
            closeForm()
        } catch (error) {
            ErrorHandler.process(error)
        }
        enableForm()
    }

    return (
        <form className='change-calendar' onSubmit={submit}>
            <h1>Change calendar</h1>
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
            <div className='change-calendar__switch'>
                <p>Active </p>
                <SwitchIOS 
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}/>
            </div>
            
            <section className='change-calendar__actions'>
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
                    Save
                </Button>
            </section>
        </form>
    )
}