import { createSlice } from '@reduxjs/toolkit';
import { ROLES } from '@/types';

const initialState = {
    info: {
        name: 'undefined',
        email: '',
        id: '',
        rating: -1,
        role: ROLES.PEASANT,
        isGeoAllowed: false
    }
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action) {
            state.info = {...state.info, ...action.payload};
        },
        increaseRating(state) {
            state.info.rating++;
        },
        decreaseRating(state) {
            state.info.rating--;
        },
        allowGeo(state) {
            state.info.isGeoAllowed = true
        }
    }
})

export const { setUser, allowGeo } = userSlice.actions;

export default userSlice.reducer;