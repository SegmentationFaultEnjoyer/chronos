import './CalendarUsers.scss'

import { useState, useMemo, useRef } from 'react'
import { useContext } from 'react'
import { CalendarContext } from '@/context'
import { CALENDAR_TYPE } from '@/types'
import { Collapse, Modal, ConfirmationModal, Notificator } from '@/common'
import { useCalendar } from '@/hooks'
import { AddUserForm, UpdateUserAtCalendarForm } from '@/forms'
import { AuthorAvatar } from '@/components'

import {
    ExpandLess as HideIcon,
    ExpandMore as ShowIcon,
    AddCircleOutline as AddIcon,
    Clear as DeleteUserIcon,
    Edit as EditIcon
} from '@mui/icons-material'
import { IconButton } from '@mui/material'

export default function CalendarUsers({ info, users, setUsers }) {
    const [isUsersShown, setIsUsersShown] = useState(false)

    const [isRemovingUser, setIsRemovingUser] = useState(false)
    const [userToProcess, setUserToProcess] = useState(null)

    const [isAddingUser, setIsAddingUser] = useState(false)
    const [isUpdatingUser, setIsUpdatingUser] = useState(false)

    const { addUserToCalendar, removeUserFromCalendar, updateUserAtCalendar } = useCalendar()
    const { isAdmin, myAccount } = useContext(CalendarContext)

    const addRef = useRef(null)
    const updateRef = useRef(null)

    const isMain = useMemo(() => info.attributes.type === CALENDAR_TYPE.MAIN, [info])

    const deleteUser = async () => {
        if (!userToProcess) return

        await removeUserFromCalendar(info.id, userToProcess)

        setUsers(prev =>({...prev, data: prev.data.filter(user => user.id !== userToProcess) }))
    }

    const addUser = async (role, email) => {
        
        const data = await addUserToCalendar(info.id, role, email)

        console.log(data);
        
        setUsers(prev =>({...prev, data: [...prev.data, data.data] }))
        Notificator.success(`User ${email} added to this calendar as a ${role}`)
    }

    const updateUser = async (role) => {
        
        const { data } = await updateUserAtCalendar(info.id, userToProcess.id, role)

        setUsers(prev => {
            const index = users.data.findIndex(user => user.id === data.id)

            const newData = {...prev}

            newData.data[index].attributes.role = data.attributes.role

            return newData
        })

        Notificator.success(`User ${userToProcess.attributes.email} role changed to ${role}`)
    }


    return (
        <>
        {!isMain && 
            <section className='calendar__users'>
                <div className='calendar__users-container' onClick={() => setIsUsersShown(prev => !prev)}>
                    <p>Users</p>
                    { !isUsersShown ? <ShowIcon /> : <HideIcon />}
                </div>
                <Collapse isOpen={isUsersShown}>
                    <div className='calendar__users-list'>
                        {users.data.map(user => 
                            <div className='calendar__header-item' key={user.id}>
                                <AuthorAvatar 
                                    id={ user.id  }
                                    name={ user.attributes.name }
                                    email={ user.attributes.email }
                                    />
                                <p className='calendar__author'>{ user.attributes.name }</p>
                                <p>{ user.attributes.role }</p>
                                {user.id !== myAccount.id && isAdmin &&
                                <>
                                    <IconButton onClick={() => {
                                        setUserToProcess(user)
                                        setIsUpdatingUser(true)
                                    }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => {
                                      setUserToProcess(user.id)
                                      setIsRemovingUser(true)  
                                    }}>
                                        <DeleteUserIcon />
                                    </IconButton> 
                                </>
                                }
                            </div>
                            )}
                        {isAdmin &&
                        <div className='calendar__add-user'>
                            <IconButton onClick={() => setIsAddingUser(true)}>
                                <AddIcon fontSize='large' />
                            </IconButton> 
                        </div>}
                    </div>
                </Collapse>
            </section>
            }

            {/* ADD USER */}
            <Modal 
                ref={addRef}
                isShown={isAddingUser}
                setIsShown={setIsAddingUser}
                isCloseByClickOutside={false}>
                <AddUserForm 
                    closeForm={() => setIsAddingUser(false)}
                    addFunc={ addUser }
                    />
            </Modal>

            {/* UPDATE USER */}
            <Modal 
                ref={updateRef}
                isShown={isUpdatingUser}
                setIsShown={setIsUpdatingUser}
                isCloseByClickOutside={false}>
                <UpdateUserAtCalendarForm 
                    closeForm={() => setIsUpdatingUser(false)}
                    updateFunc={ updateUser }
                    user={userToProcess}
                    />
            </Modal>

            {/* REMOVE USER */}
            <ConfirmationModal 
                isOpen={ isRemovingUser }
                setIsOpen={ setIsRemovingUser }
                action={ deleteUser }
                message={ `User removed from this calendar!` }/>
            </>
    )
}