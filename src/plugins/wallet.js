import { mapGetters, mapActions } from 'vuex'
import { ethers } from 'ethers'

export default {
    computed: {
        ...mapGetters(['loggedIn', 'metaMaskAccount', 'walletConnected'])
    },
    methods: {
        ...mapActions(['setChainStatus', 'setChainId', 'setMetaMaskAccount', 'setUserLoggedIn', 'setMetaMaskWallet', 'setWalletConnectionStatus']),

        async connectWallet() {
            if (this.metaMaskAccount === true) {
                await this.disconnectWallet()
                return true
            }

            if (window.ethereum !== undefined) {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum)
                    await provider.send("eth_requestAccounts", [])
                    const signer = await provider.getSigner()
                    const network = await provider.getNetwork()

                    const accounts = await signer.getAddress()
                    this.setMetaMaskAccount(accounts)
                    this.setChainId(network.chainId)


                    if (network.chainId === 1666600001 || network.chainId === 1666600002 || network.chainId === 1666600003 || network.chainId === 1666700000 || network.chainId === 1666700001 || network.chainId === 1666700002 || network.chainId === 1666700003) {
                        this.setChainStatus('Wrong shard or connected to the testnet. <br> Please connect to Harmony Mainnet Shard 0 to connect to the world.')
                        this.setUserLoggedIn(true)
                        return false
                    } else if (network.chainId === 1666600000) {
                        this.setChainStatus(true)
                        this.setMetaMaskWallet({ signer })
                        this.setUserLoggedIn(true)
                    } else {
                        this.setChainStatus('Wrong network. <br> Please connect to Harmony Mainnet Shard 0 to connect to the world.')
                        this.setUserLoggedIn(true)
                        return false
                    }

                    if (this.loggedIn === true) {
                        this.setWalletConnectionStatus(!this.walletConnected)
                        return true
                    }
                } catch {
                    this.setChainStatus('Please connect your metamask.')
                    return false
                }
            } else {
                this.setChainStatus('Install metamask to continue.')
                return false
            }
        },

        async disconnectWallet() {
            await this.setDefaultWallet()
            this.setUserLoggedIn(false)
            this.setWalletConnectionStatus(!this.walletConnected)
        },

        async setDefaultWallet() {
            if (!this.loggedIn) {
                this.setMetaMaskAccount(["0x0000000000000000000000000000000000000003"])
            }
        }
    }
}