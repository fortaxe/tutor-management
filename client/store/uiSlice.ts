import { createSlice } from '@reduxjs/toolkit';

interface UiState {
    isAddMemberModalOpen: boolean;
}

const initialState: UiState = {
    isAddMemberModalOpen: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openAddMemberModal: (state) => {
            state.isAddMemberModalOpen = true;
        },
        closeAddMemberModal: (state) => {
            state.isAddMemberModalOpen = false;
        },
        toggleAddMemberModal: (state) => {
            state.isAddMemberModalOpen = !state.isAddMemberModalOpen;
        }
    },
});

export const { openAddMemberModal, closeAddMemberModal, toggleAddMemberModal } = uiSlice.actions;
export default uiSlice.reducer;
