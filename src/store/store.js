import {
    createStore
} from "vuex";

import wallet from '../plugins/wallet';
import {
    ethers
} from 'ethers';

export const store = createStore({
    namespaced: true,
    modules: {
        wallet
    },
    state() {
        return {
            FIRST_TIME: true,
            CHAIN_STATUS: '',
            CHAIN_ID: 0,
            USER_LOGGED_IN: undefined,
            WALLET_CONNECTION_STATUS: undefined,
            METAMASK_ACCOUNT: undefined,
            METAMASK_WALLET: undefined,
            NETWORK_ID: undefined
        }
    },

    getters: {
        testGet(state) {
            return state.METAMASK_WALLET
        },
        chainStatus(state) {
            return state.CHAIN_STATUS;
        },
        chainID(state) {
            return state.CHAIN_ID;
        },
        loggedIn(state) {
            return state.USER_LOGGED_IN;
        },
        walletConnected(state) {
            return state.WALLET_CONNECTION_STATUS;
        },
        metaMaskAccount(state) {
            return state.METAMASK_ACCOUNT;
        },
        metaMaskWallet(state) {
            return state.METAMASK_WALLET;
        },
        networkId(state) {
            return state.NETWORK_ID;
        },
    },

    setters: {

    },

    mutations: {
        SET_FIRST_TIME(state, value) {
            state.FIRST_TIME = value;
        },
        SET_CHAIN_STATUS(state, value) {
            state.CHAIN_STATUS = value;
        },
        SET_CHAIN_ID(state, value) {
            state.CHAIN_ID = value;
        },
        SET_USER_LOGGED_IN(state, value) {
            state.USER_LOGGED_IN = value;
        },
        SET_WALLET_CONNECTION_STATUS(state, value) {
            state.WALLET_CONNECTION_STATUS = value;
        },
        SET_METAMASK_ACCOUNT(state, value) {
            state.METAMASK_ACCOUNT = value;
        },
        SET_METAMASK_WALLET(state, value) {
            const obj = Object.freeze(value);
            state.METAMASK_WALLET = value;
        },
        SET_NETWORK_ID(state, value) {
            state.NETWORK_ID = value;
        }
    },

    actions: {
        setChainStatus({
            commit
        }, value) {
            commit('SET_CHAIN_STATUS', value);
        },
        setChainId({
            commit
        }, value) {
            commit('SET_CHAIN_ID', value);
        },
        setUserLoggedIn({
            commit
        }, value) {
            commit('SET_USER_LOGGED_IN', value);
        },
        setWalletConnectionStatus({
            commit
        }, value) {
            commit('SET_WALLET_CONNECTION_STATUS', value);
        },
        setMetaMaskAccount({
            commit
        }, value) {
            commit('SET_METAMASK_ACCOUNT', value);
        },
        setMetaMaskWallet({
            commit
        }, value) {
            commit('SET_METAMASK_WALLET', value.signer);
        },
        setNetworkId({
            commit
        }, value) {
            commit('SET_NETWORK_ID', value);
        },
    }
})