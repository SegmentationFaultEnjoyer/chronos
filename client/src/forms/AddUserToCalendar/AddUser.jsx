import './AddUser.scss'

import { useState } from 'react';
import { TextField, Button } from '@mui/material'
import { SingleSelect } from '@/fields'
import { useForm } from '@/hooks';
import { ROLES } from '@/types';

export default function AddUser({ closeForm, addFunc }) {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState(ROLES.USER)

    const { isFormDisabled, disableForm, enableForm } = useForm();

    const submit = async (e) => {
        e.preventDefault()

        disableForm()
        await addFunc(role, email)
        enableForm()

        closeForm()
    }

    return (
        <form className='add-user' onSubmit={submit}>
            <h1>Add new user</h1>
            <section className='add-user__inputs'>
                <TextField
                    fullWidth
                    variant='outlined' label='Email'
                    color="primary_light"
                    value={email}
                    onChange={e => { setEmail(e.target.value) }}
                    disabled={isFormDisabled}
                    required />
                <SingleSelect
                    value={role}
                    setValue={setRole}
                    label='Role'
                    size='large'
                    choices={Array.from(Object.values(ROLES))} />
            </section>

            <section className='add-user__actions'>
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
                    Add
                </Button>
            </section>
        </form>
    )
}