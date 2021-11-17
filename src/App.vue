<template>
  <section style="
      background: url('/images/map/worldmap.png') no-repeat;
      background-size: cover;
      min-height: 100vh;
    " class="flex">
    <div style="background: #1c1c1c; z-index: 9999; overflow-y: auto" class="screen w-full">
      <section id="section-i-1" class="border-b-4 border-primary-alt" style="
          background: url('/images/SVG/homepage-bg-top.svg') no-repeat top right;
        ">
        <div class="container mx-auto text-center pt-12 md:pt-12 pb-12 md:pb-12">
          <h1 class="text-2xl md:text-5xl text-primary-alt font-semibold">
            Slots
          </h1>
        </div>
      </section>
      <div v-if="!loader.slots" class="p-4 xl:p-8 relative mt-12">
        <div class="m-auto text-center">

          <br />
          <p class="text-2xl">Loading...</p>
        </div>
      </div>
      <div v-if="loader.slots" id="slot-container"
        class="p-4 mt-32 md:p-8 relative flex xl:flex-row md:flex-col sm:flex-col justify-evenly mt-10">

        <div
          class="xl:w-1/5 md:w-full sm:w-full xl:mt-16 md:mt-6 md:mb-4 sm:mt-6 sm:mb-4 text-center flex xl:flex-col md:flex-row sm:flex-row xl:justify-start md:justify-evenly sm:justify-evenly">
          <div v-if='windowWidth > 1024' class="text-2xl mb-3">Control Panel</div>
          <hr class="opacity-50" />
          <div :key="loader.allowance" class="mt-3 mb-3 flex justify-center">
            <a v-if="allowance <= 0" v-on:click="addAllowance(999999999999.9999)" class="hpt-btn w-5/6"
              href="javascript:;"><span><span v-if="!loader.contractAllowance">Enable Contract</span>
                <i v-if="loader.contractAllowance" class="fas fa-cog fa-spin"></i></span></a>
            <a v-if="allowance > 0" v-on:click="addAllowance(0)" class="hpt-btn w-5/6" href="javascript:;"><span><span
                  v-if="!loader.contractAllowance">Disable Contract</span>
                <i v-if="loader.contractAllowance" class="fas fa-cog fa-spin"></i></span></a>
          </div>
          <div v-if="allowance > 0" class="mt-3 mb-3 flex justify-center">
            <a v-on:click="showInsertCoinModal()" class="hpt-btn" href="javascript:;"><span><span
                  v-if="!loader.contractInsert">Insert XYA</span>
                <i v-if="loader.contractInsert" class="fas fa-cog fa-spin"></i></span></a>
          </div>
          <div v-if="allowance > 0" class="mt-3 mb-3 flex justify-center">
            <a v-on:click="withdraw()" class="hpt-btn" href="javascript:;"><span>
                <span v-if="!loader.contractWithdraw">Collect</span>
                <i v-if="loader.contractWithdraw" class="fas fa-cog fa-spin"></i></span></a>
          </div>
          <div v-if="allowance > 0" class="mt-3 mb-3 flex justify-center">
            <a v-on:click="forceMachineUpdate()" class="hpt-btn" href="javascript:;"><span><span
                  v-if="!loader.contractUpdateMachine">Update Machine</span>
                <i v-if="loader.contractUpdateMachine" class="fas fa-cog fa-spin"></i></span></a>
          </div>
          <div class="mt-3 mb-3 flex justify-center">
            <a v-on:click="showPayTable()" class="hpt-btn" href="javascript:;"><span>Paytable</span></a>
          </div>
          <div class="mt-3 mb-3 flex justify-center">
            <a v-on:click="showTutorial()" class="hpt-btn" href="javascript:;"><span>Tutorial</span></a>
          </div>
        </div>
        <SlotMachine style="width: 450px; height: 500px"
          class='xl:mr-10 xl:mt-0 xl:mr-0 xl:ml-0 md:mr-auto md:ml-auto md:mt-10 sm:mr-auto sm:ml-auto'
          :contract="this.slotsContract" ref="slotMachine" v-on:roundFinished="onRoundFinished($event)"></SlotMachine>
        <div v-if='windowWidth > 1440' class="w-1/5 mt-16 text-center xl:visible md:invisible sm:invisible">
          <div class="text-2xl mb-3">Round Winnings</div>
          <div v-if="roundsHistory.length === 0">
            <hr class="opacity-50" />
            <p class="opacity-75 mt-3">You haven't played any rounds.</p>
          </div>
          <div v-for="(round, index) in roundsHistory" :key="index">
            <hr class="opacity-50" />
            <div class="mt-3 mb-3">
              <p class="opacity-75">Won</p>
              <p v-if="round > 0" class="text-xl">{{ round }} XYA</p>
              <p v-else class="text-xl opacity-50">Nothing</p>
            </div>
          </div>
        </div>
      </div>

    
    </div>
  </section>
</template>

<script>
  import fromExponential from "from-exponential";
  import SlotMachine from "./components/SlotMachine";

  import {
    mapGetters,
    mapActions
  } from "vuex";

  const { ethers } = require('ethers');

  import wallet from "./plugins/wallet";

  import Slots from "../artifacts/slots.json";
  import HPTToken from "../artifacts/hsToken.json";

  export default {
    name: "Slots",
    components: {
      SlotMachine,
    },
    mixins: [wallet],
    data() {
      return {
        roundsHistory: [],
        roundsHistoryMax: 5,
        mainContract: null,
        allowance: 0,
        slotsContract: null,
        xyaAmount: 0,
        windowWidth: 0,
        loader: {
          contractAllowance: false,
          contractInsert: false,
          contractWithdraw: false,
          contractUpdateMachine: false,
          slots: false,
          allowance: false,
        },
        nudgeInfo: {
          chance: 0,
          min: 0,
          max: 0,
        },
        holdInfo: {
          chance: 0,
          min: 0,
          max: 0,
        },
        tutorial: {
          page: 0,
          pages: 3
        },
      };
    },
    async mounted() {
      
    await this.connectWallet().then((success) => {
      if (success === true) {
        this.loading = false
      } else {
        this.loading = false
      }
    })

    window.ethereum.on('accountsChanged', async () => {
      await this.connectWallet().then((success) => {
        if (success === true) {
          this.loading = false
        } else {
          this.loading = false
        }
      })
    })

    window.ethereum.on('chainChanged', async () => {
      await this.connectWallet().then((success) => {
        if (success === true) {
          this.loading = false
        } else {
          this.loading = false
        }
      })
    })

    const signer =  this.$store.getters.testGet;


      this.mainContract = new ethers.Contract(
        HPTToken.address,
        HPTToken.abi,
        signer
      );

      this.slotsContract = new ethers.Contract(
        Slots.address,
        Slots.abi,
        signer
      );

      const allowance = await this.mainContract.allowance(
        this.metaMaskAccount,
        Slots.address
      );

      this.allowance = ethers.utils.formatEther(
        allowance._isBigNumber ?
        ethers.BigNumber.from(allowance).toString() :
        allowance
      );

      await this.fetchGameData();
      this.onResize();

      this.loader.allowance = true;
      this.loader.slots = true;

      this.$nextTick(() => {
        window.addEventListener('resize', this.onResize);
      })
    },
    computed: {
      ...mapGetters(["metaMaskAccount", "metaMaskWallet", "testGet"]),
    },
    methods: {
          ...mapActions([
      'setFavourites',
      'setFirstTime',
    ]),

      onResize() {
        this.windowWidth = window.innerWidth;
        if (this.windowWidth > 1440) {
          this.roundsHistoryMax = 5;
        } else {
          this.roundsHistoryMax = 3;
        }
        this.getHistoryData();
      },

      async getHistoryData() {
        this.roundsHistory = await this.getLocalStorageItem("rounds_history");
        this.roundsHistory = !this.roundsHistory ? [] :
          this.roundsHistory.slice(0, this.roundsHistoryMax);
      },

      showPayTable() {
        this.$refs.slotMachine.showPayTable();
      },

      showInsertCoinModal() {
        this.$modal.show("insert");
      },

      showTutorial() {
        this.$modal.show("tutorial");
      },

      async forceMachineUpdate() {
        await this.$refs.slotMachine.fetchPlayerData();
        await this.$refs.slotMachine.fetchGameReels();
      },

      async insertCoin() {
        if (this.loader.contractInsert) return;
        try {
          const amount = this.xyaAmount;
          let actual = 0;

          if (amount > 0) {
            actual = amount * 10 ** 18;
          } else {
            actual = 0;
          }

          const arg = fromExponential(actual);
          const tx = await this.slotsContract.deposit(arg);

          this.loader.contractInsert = true;
          this.$modal.hide("insert");

          await tx.wait(1);
          this.loader.contractInsert = false;
          this.xyaAmount = 0;
        } catch (err) {
          this.loader.contractInsert = false;
        }
      },

      async withdraw() {
        if (this.loader.contractWithdraw) return;
        try {
          const tx = await this.slotsContract.withdrawBank();
          this.loader.contractWithdraw = true;
          await tx.wait(1);
          this.loader.contractWithdraw = false;
        } catch (err) {
          this.loader.contractWithdraw = false;
        }
      },

      async addAllowance(amount) {
        if (this.loader.contractAllowance) return;
        let actual = 0;

        if (amount > 0) {
          actual = amount * 10 ** 18;
        } else {
          actual = 0;
        }

        try {
          const arg = fromExponential(actual);
          const tx = await this.mainContract.approve(
            this.slotsContract.address,
            arg
          );
          this.loader.contractAllowance = true;

          await tx.wait(1);
          this.loader.contractAllowance = false;
        } catch (err) {
          this.loader.contractAllowance = false;
        }

        const data = await this.mainContract.allowance(
          this.metaMaskAccount,
          this.slotsContract.address
        );
        this.allowance = ethers.utils.formatEther(
          data._isBigNumber ? ethers.BigNumber.from(data).toString() : data
        );
      },

      async onRoundFinished(roundWinnings) {
        this.appendToLocalStorageList(
          "rounds_history",
          roundWinnings,
          this.roundsHistoryMax
        );
        this.roundsHistory.unshift(roundWinnings);
        this.roundsHistory = this.roundsHistory.slice(0, this.roundsHistoryMax);
      },

      async fetchGameData() {
        const holdsInfo = await this.slotsContract.holdsInfo();
        const nudgesInfo = await this.slotsContract.nudgesInfo();

        this.holdInfo.chance = holdsInfo[0];
        this.holdInfo.min = holdsInfo[1];
        this.holdInfo.max = holdsInfo[2];

        this.nudgeInfo.chance = nudgesInfo[0];
        this.nudgeInfo.min = nudgesInfo[1];
        this.nudgeInfo.max = nudgesInfo[2];

        this.roundsHistory = await this.getLocalStorageItem("rounds_history");
        this.roundsHistory = !this.roundsHistory ? [] :
          this.roundsHistory.slice(0, this.roundsHistoryMax);
      },

      //WILL MOVE THESE IN A LOCAL STORAGE VUE PLUGIN
      async appendToLocalStorageList(key, item, max = 999) {
        const listData = await localStorage.getItem(key);
        let listItems = JSON.parse(listData);
        if (!listItems || listItems.length === 0) {
          await localStorage.setItem(key, JSON.stringify([item]));
          return;
        }

        if (listItems.length > max) {
          listItems.slice(0, max);
        }

        listItems.unshift(item);
        await localStorage.setItem(key, JSON.stringify(listItems));
      },

      async removeFromLocalStorageList(key, item) {
        const listData = await localStorage.getItem(key);
        let listItems = JSON.parse(listData);

        listItems = listItems.filter((c) => c !== item);
        await localStorage.setItem(key, JSON.stringify(listItems));
      },

      async getLocalStorageItem(key) {
        const itemData = await localStorage.getItem(key);
        let item = JSON.parse(itemData);

        return item;
      },
    },
  };
</script>

<style scoped>
  #slot-container {
    --var-slots-bg: #1e2b22;
    --var-slots-dark-bg: #181f1f;
    --var-hilight-color: #43ac6b;
    --var-hilight-strong: #8cd1a6;
    --var-soft-shadow-color: #263c2f;
    --var-shadow-color: #0e1111;
    --var-border-radius: 12px;
    border-radius: 12px;
    color: #8cd1a6 !important;
    text-transform: uppercase;
    font-family: 'Spe';
  }

  #tutorial p>span {
    font-weight: bold;
    color: #8cd1a6 !important;
  }

  #tutorial a:hover {
    color: #8cd1a6;
  }

  .inner-shadow {
    -moz-box-shadow: inset 0 0 12px var(--var-shadow-color);
    -webkit-box-shadow: inset 0 0 12px var(--var-shadow-color);
    box-shadow: inset 0 0 12px var(--var-shadow-color);
  }

  .txt-hilight {
    font-weight: bold;
    color: #8cd1a6 !important;
  }

  .txt-tutorial {
    color: rgba(255, 255, 255, 0.75);
  }

  .highlight-border {
    border-width: 1px;
    border-style: solid;
    border-image: linear-gradient(225deg,
        var(--var-hilight-color),
        var(--var-soft-shadow-color),
        var(--var-soft-shadow-color)) 1 25%;
  }

  .hpt-btn {
    background-color: var(--var-slots-bg);
    border-radius: var(--var-border-radius);
    box-sizing: border-box;
    color: #8cd1a7c7;
    display: block;
    height: 40px;
    font-size: max(calc(1vw - 1px), 12px);
    padding: 4px;
    position: relative;
    text-decoration: none;
    z-index: 2;
    transition: all 1s ease-out;
    width: 100%;
    max-width: 228px;
    min-width: 96px;
  }

  .hpt-btn:hover {
    background-image: linear-gradient(190deg,
        var(--var-hilight-strong) 5%,
        var(--var-hilight-color) 10%,
        var(--var-soft-shadow-color),
        var(--var-slots-bg));
    color: #fff;
  }

  .hpt-btn span {
    align-items: center;
    background: var(--var-slots-bg);
    border-radius: var(--var-border-radius);
    display: flex;
    justify-content: center;
    height: 100%;
    transition: background 0.1s ease;
    width: 100%;
  }

  .hpt-btn:hover span {
    background: transparent;
  }
</style>