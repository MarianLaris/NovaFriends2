import { createStore, combineReducers } from 'redux';
import { userReducer } from './userState';
import { followingsReducer } from './followingsState';
import { followersReducer } from './followersSate';
import { BlockedUsersReducer } from './blockedUsers'
import { BlockedByUsersReducer } from './blockedByState'
import { modalStateReducer } from './loadingModalState'

const Reducers = combineReducers({ userReducer, followingsReducer, followersReducer, BlockedUsersReducer, BlockedByUsersReducer, modalStateReducer })

const Store = createStore(Reducers);


export default Store;