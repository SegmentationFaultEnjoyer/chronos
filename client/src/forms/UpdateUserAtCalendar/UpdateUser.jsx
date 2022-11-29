import './UpdateUser.scss'

import { useState } from 'react';
import { TextField, Button } from '@mui/material'
import { SingleSelect } from '@/fields'
import { useForm } from '@/hooks';
import { ROLES } from '@/types';

export default function UpdateUser({ closeForm, updateFunc, user }) {
    const [role, setRole] = useState(user.attributes.role)

    const { isFormDisabled, disableForm, enableForm } = useForm();

    const submit = async (e) => {
        e.preventDefault()

        disableForm()
        await updateFunc(role)
        enableForm()

        closeForm()
    }

    return (
        <form className='update-user' onSubmit={submit}>
            <h1>{ `Update role ${user.attributes.email}` }</h1>
            <section className='update-user__inputs'>
                <SingleSelect
                    value={role}
                    setValue={setRole}
                    label='Role'
                    size='large'
                    choices={Array.from(Object.values(ROLES))} />
            </section>

            <section className='update-user__actions'>
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