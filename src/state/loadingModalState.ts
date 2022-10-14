



export interface LoadingModalState {
    isOpen: boolean
}


const modalState = {
    isOpen: true
}



export function updateModalState(payload: LoadingModalState) {

    return ({
        type: 'UPDATE_MODAL',
        payload
    })
}


export function modalStateReducer(state = modalState, action: { type: string, payload: LoadingModalState }) {

    if (action.type == "UPDATE_MODAL") {
        return action.payload
    }
    else {
        return state
    }
}



export const selectModalState = (state: any) => state.modalStateReducer