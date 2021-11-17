<template>
  <div class="pt-3 flex items-center justify-center relative select-none">
    <div class="machine-top"></div>
    <div class="machine-bottom"></div>
    <div class="machine-container flex items-center flex-col justify-center">
      <div class="slot-trigger">
        <div class="slot-ring-1">
          <div ref="shadow1" class="ring-shadow"></div>
        </div>
        <div class="slot-ring-2">
          <div ref="shadow2" class="ring-shadow"></div>
          <div ref="handle" class="slot-handle">
            <div v-on:click="startRound()" class="slot-knob"></div>
          </div>
        </div>
      </div>
      <div class="flex justify-evenly" style="width: 75%; height: 15%"></div>
      <div class="screen medium inner-shadow flex flex-row justify-evenly">
        <transition name="fade">
          <div v-if="isBusy" class="
              absolute
              flex flex-col
              justify-center
              items-center
              screen-cover
            ">
            <div class="mb-6">
              {{ this.playerTransactions.length }} Pending transaction(s)
            </div>
            <div>
              <img class="w-8 h-8 m-auto opacity-85" src="/images/XYA.png" alt="XYA logo"
                style="animation: rotation 2s infinite linear" />
            </div>
          </div>
        </transition>
        <div class="screen-shadow"></div>

        <div class="
            w-full
            h-full
            flex flex-row
            justify-evenly
            overflow-hidden
            pl-3
            pr-3
          ">
          <SlotReel ref='reel_1' :reelBlockSize="96 - 10 * (reelCount - 3)"></SlotReel>
          <SlotReel ref='reel_2' :reelBlockSize="96 - 10 * (reelCount - 3)"></SlotReel>
          <SlotReel ref='reel_3' :reelBlockSize="96 - 10 * (reelCount - 3)"></SlotReel>
        </div>
        <transition name="nudge">
          <div v-if="showNudges" class="z-50 absolute flex justify-around bottom-5 w-80 h-3">
            <div v-on:click="nudgeReel(i - 1)" class="nudge-button" v-for="i in 3" :key="i">
              NUDGE
            </div>
          </div>
        </transition>
      </div>
      <div class="flex justify-evenly" style="width: 75%">
        <div class="w-4/12 h-16 p-4">
          <SlotButton ref='hold_1' v-on:buttonClick="holdGameReel(i - 1, $event)" :title="'Hold'"
            :info="'25'">
          </SlotButton>
        </div>
        <div class="w-4/12 h-16 p-4">
          <SlotButton ref='hold_2' v-on:buttonClick="holdGameReel(i - 1, $event)" :title="'Hold'"
            :info="'25'">
          </SlotButton>
        </div>
        <div class="w-4/12 h-16 p-4">
          <SlotButton ref='hold_3' v-on:buttonClick="holdGameReel(i - 1, $event)" :title="'Hold'"
            :info="'25'">
          </SlotButton>
        </div>
      </div>
      <div style="height: 35%; width: 80%">
        <SlotScreen :glowRed="showRoundWinnings && roundWinnings == 0"
          :glowGreen="showRoundWinnings && roundWinnings > 0">
          <template v-slot:content>
            <div v-show="!gameLoaded" class="w-full h-4/6 flex justify-center items-center text-center">
              Fetching data...
            </div>

            <div v-show="gameLoaded" v-if="!showRoundWinnings" :key="keys.screen" class="w-full relative h-4/6">
              <div class="flex justify-evenly mb-5 w-full text-center">
                <div>
                  <p class="glitch" data-text="Holds">Holds</p>
                  <span class="glitch2" :data-text="playerHolds">{{
                    playerHolds
                  }}</span>
                </div>
                <div>
                  <p class="glitch" data-text="Credits">Credits</p>
                  <span class="glitch2" :data-text="playerCredit">{{
                    parseInt(playerCredit)
                  }}</span>
                </div>
                <div>
                  <p class="glitch" data-text="Nudges">Nudges</p>
                  <span class="glitch2" :data-text="playerNudges">{{
                    playerNudges
                  }}</span>
                </div>
              </div>
              <hr class="opacity-25" />
              <div class="flex justify-evenly mt-5 w-full">
                <p>Bank</p>
                <span>{{ parseInt(playerBank) }}</span>
              </div>
            </div>
            <div v-else class="w-full h-4/6 flex justify-center items-center text-center">
              <div>
                <p class="glitch" data-text="Winnings">You Won!</p>
                <span class="glitch2" :data-text="roundWinnings">{{
                  roundWinnings
                }}</span>
              </div>
            </div>
          </template>
        </SlotScreen>
      </div>
      <div class="mb-2"></div>
    </div>


  </div>
</template>

<script>
  import wallet from "../plugins/wallet";
  import SlotReel from "./SlotReel";
  import SlotButton from "./SlotButton";
  import SlotScreen from "./SlotScreen";
  import {
    mapGetters
  } from "vuex";
  import {
    inject,
    ref
  } from "vue";

  const ROUND_STATE = {
    PAUSED: 0,
    ON: 1,
    OFF: 2,
  };

  const lerp = (x, y, a) => {
    if (y - x < 2) return y;
    return x * (1 - a) + y * a;
  };

  export default {
    name: "SlotMachine",
    mixins: [wallet],
    components: {
      SlotReel,
      SlotButton,
      SlotScreen,
    },
    props: {
      reelCount: {
        type: Number,
        default: 3,
      },
      contract: Object,
    },
    data() {
      return {
        gameLoop: null,
        gameReelSheets: [],
        gameReels: [],
        gameButtons: [],
        gameError: [],
        gamePayTable: [],
        spamProtection: 0,
        gameLoaded: false,
        showRoundWinnings: false,
        roundWinningsTimer: 0,
        roundWinnings: 0,
        roundState: ROUND_STATE.OFF,
        playerCredit: 0,
        playerBank: 0,
        playerHolds: 0,
        playerNudges: 0,
        playerTransactions: [],
        playerPacket: {
          playerCredit: 0,
          playerBank: 0,
        },
        assets: {
          images: [],
        },
        keys: {
          screen: 0,
        },
      };
    },
    async mounted() {
      this.gameReels = [this.$refs.reel_1, this.$refs.reel_2, this.$refs.reel_3];
      this.gameButtons = [this.$refs.hold_1, this.$refs.hold_2, this.$refs.hold_3];
      this.startGameLoop();
      this.$nextTick(async () => {
        await this.fetchPlayerData();
        await this.fetchGameReels();

       /* this.contract.on("Withdraw", async () => {
          await this.fetchPlayerData();
        });

        this.contract.on("Deposit", async () => {
          await this.fetchPlayerData();
        });*/

        const payLinesCount = await this.contract.getPayTableLength();

        this.gamePayTable = [];
        for (let i = 0; i < payLinesCount; i++) {
          const payLine = await this.contract.getPayLineData(i);
          this.gamePayTable.push({
            payLineId: payLine[0].join("-"),
            payLine: payLine[0],
            payOut: payLine[1] / (10 ** 18),
          });
        }
      });

      /*const txData = await localStorage.getItem("slots_tx");
            let transactions = JSON.parse(txData);
            if (transactions) {
              for (let i = 0; i < transactions.length; i++) {
                this.playerTransactions.push(transactions[i]);
                this.resolveTransaction(transactions[i].tx);
              }
            }*/
    },
    methods: {
      getRefName(prefix, i) {
        return prefix + '_' + i;
      },
      startGameLoop() {
        var lastUpdate = Date.now();
        this.gameLoop = setInterval(() => {
          let now = Date.now();
          var dt = now - lastUpdate;
          lastUpdate = now;
          this.update(dt);
        }, 0);
      },

      update(dt) {
        for (let i = 0; i < this.gameReels.length; i++) {
          this.gameReels[i].update(dt);
        }

        this.spamProtection -= dt;

        this.playerCredit = lerp(
          this.playerCredit,
          this.playerPacket.playerCredit,
          0.02
        );
        this.playerBank = lerp(
          this.playerBank,
          this.playerPacket.playerBank,
          0.02
        );

        if (this.showRoundWinnings) {
          this.roundWinningsTimer += dt;
          if (this.roundWinningsTimer > 3000) {
            this.showRoundWinnings = false;
          }
        }
      },

      async fetchPlayerData() {
        try {
          if (this.spamProtection > 0) return;

          const playerCredit =
            (await this.contract.creditBalanceOf(this.metaMaskAccount)) /
            10 ** 18;
          const playerBank = await this.contract.bankOf(this.metaMaskAccount) / 10 ** 18;

          this.playerHolds = await this.contract.holdsOf(this.metaMaskAccount);
          this.playerNudges = await this.contract.nudgesOf(this.metaMaskAccount);
          this.playerPacket = {
            playerCredit: playerCredit,
            playerBank: playerBank,
          };

          this.keys.screen++;
          this.gameLoaded = true;
        } catch (err) {
          this.gameLoaded = false;
          setTimeout(async () => {
            await this.fetchPlayerData();
          }, 1000);
        }
      },

      async fetchGameReels() {
        if (this.spamProtection > 0) return;

        if (
          this.roundState === ROUND_STATE.ON ||
          this.playerTransactions.length > 0
        )
          return;

        try {
          this.gameReelSheets = await this.contract.reels();
          const positions = await this.contract.positionsOf(this.metaMaskAccount);
          const currentHolds = await this.contract.heldOf(this.metaMaskAccount);

          let imageIds = this.gameReelSheets[0].filter(
            (item, i, ar) => ar.indexOf(item) === i
          );

          for (let i = 0; i < imageIds.length; i++) {
            this.assets.images.push(
              require("../../public/images/" +
                imageIds[i] +
                ".png")
            );
          }

          for (let i = 0; i < this.gameReels.length; i++) {
            this.gameReels[i].setReelSheet(this.gameReelSheets[i], this.assets);
            this.gameReels[i].setFinalPosition(positions[i]);

            if (currentHolds[i]) {
              this.gameButtons[i].pressButton();
              this.gameReels[i].holdReel();
            }
          }
        } catch (err) {
          this.showGameError("Transaction failed.");
        }
      },

      async startRound() {
        if (this.spamProtection > 0) return;
        if (
          this.roundState === ROUND_STATE.ON ||
          this.playerTransactions.length > 0
        )
          return;

        try {
          this.spamProtection = 1500;
          var tx = await this.contract.spin();
          this.showRoundWinnings = false;
          this.roundState = ROUND_STATE.ON;
          this.animateKnob();

          for (let i = 0; i < this.gameReels.length; i++) {
            setTimeout(() => {
              this.gameReels[i].startRound();
            }, i * 150);
          }

          this.addGameTransaction(tx, "SPIN");
          await tx.wait(1);
          const positions = await this.contract.positionsOf(this.metaMaskAccount);

          for (let i = 0; i < this.gameReels.length; i++) {
            setTimeout(() => {
              this.gameReels[i].setFinalPosition(positions[i]);
            }, 1500 - 250 * i);
          }

          setTimeout(async () => {
            await this.endRound(positions);
          }, 1000 + 250 * this.gameReels.length);

          this.fetchPlayerData();
          this.solveGameTransaction(tx);
        } catch (err) {
          const positions = await this.contract.positionsOf(this.metaMaskAccount);

          for (let i = 0; i < this.gameReels.length; i++) {
            this.gameReels[i].forceStop(positions[i]);
          }
          this.roundState = ROUND_STATE.OFF;
          this.solveGameTransaction(tx);

          if (this.playerCredit == 0) {
            this.showGameError(
              "Not enough credit!",
              "Please insert more tokens to play the game!"
            );
          } else {
            this.showGameError(err);
          }
        }
      },

      async holdGameReel(index, validateClick) {
        try {
          if (!this.roundFinished) throw "Invalid operation.";
          const holds = await this.contract.holdsOf(this.metaMaskAccount);
          const helds = await this.contract.heldOf(this.metaMaskAccount);

          if (helds.filter((c) => c == true).length >= 2 || !this.isLegalHold)
            throw "You can't hold more than 2 reels at a time!";

          if (holds == 0 || !holds) {
            throw "You have 0 holds left.";
          }

          var tx = await this.contract.hold(index);
          this.addGameTransaction(tx, "HOLD");
          await tx.wait(1);

          const holdsPositions = await this.contract.heldOf(this.metaMaskAccount);
          if (!holdsPositions[index]) return;

          this.solveGameTransaction(tx);
          validateClick(true);
          this.gameReels[index].holdReel();
        } catch (err) {
          this.showGameError(err);
          this.solveGameTransaction(tx);
          validateClick(false);
        }
      },

      async nudgeReel(index) {
        try {
          if (!this.roundFinished) throw "Invalid operation.";
          const nudges = await this.contract.nudgesOf(this.metaMaskAccount);

          if (nudges === 0 || !nudges) {
            throw "You have 0 nudges left.";
          }

          var tx = await this.contract.nudge(index);
          this.addGameTransaction(tx, "NUDGE");
          await tx.wait(1);

          const positions = await this.contract.positionsOf(this.metaMaskAccount);
          this.gameReels[index].setFinalPosition(positions[index]);
          this.solveGameTransaction(tx);
          await this.endRound(positions);
        } catch (err) {
          this.showGameError(err);
          this.solveGameTransaction(tx);
        }
      },

      async addGameTransaction(tx, type) {
        const newTx = {
          tx: tx,
          type: type,
        };
        this.playerTransactions.push(newTx);

        /*const itemsData = await localStorage.getItem("slots_tx");
              let items = JSON.parse(itemsData);
              if (!items || items.length === 0) {
                await localStorage.setItem("slots_tx", JSON.stringify([newTx]));
                return;
              }

              items.push(newTx);
              await localStorage.setItem("slots_tx", JSON.stringify(items));*/
      },

      async solveGameTransaction(tx) {
        this.playerTransactions = this.playerTransactions.filter(
          (c) => c.tx.hash !== tx.hash
        );
        this.$emit("txFinished");
        await this.fetchPlayerData();

        /*const itemsData = await localStorage.getItem("slots_tx");
              let items = JSON.parse(itemsData);

              items = items.filter((c) => c.tx.hash !== tx.hash);
              await localStorage.setItem("slots_tx", JSON.stringify(items));*/
      },

      animateKnob() {
        const handle = this.$refs.handle;
        const shadow1 = this.$refs.shadow1;
        const shadow2 = this.$refs.shadow2;

        handle.classList.add("handle-anim");
        shadow1.classList.add("shadow-anim");
        shadow2.classList.add("shadow-anim");

        setTimeout(() => {
          handle.classList.remove("handle-anim");
          shadow1.classList.remove("shadow-anim");
          shadow1.classList.remove("shadow-anim");
        }, 1000);
      },

      async endRound(positions) {
        this.resetHolds();
        const payLineId =
          this.gameReelSheets[0][positions[0]] +
          "-" +
          this.gameReelSheets[1][positions[1]] +
          "-" +
          this.gameReelSheets[2][positions[2]];
        const payLine = this.gamePayTable.filter(
          (c) => c.payLineId === payLineId
        );

        this.roundWinnings = !payLine[0] ? 0 : payLine[0].payOut;

        this.showRoundWinnings = true;
        this.roundWinningsTimer = 0;
        this.roundState = ROUND_STATE.OFF;

        this.$emit("roundFinished", this.roundWinnings);
      },

      resetHolds() {
        for (let i = 0; i < this.gameButtons.length; i++) {
          this.gameButtons[i].releaseButton();
          this.gameReels[i].releaseReel();
        }
      },

      showGameError(error, additionalText = "") {
        const errorMessage =
          typeof error == "object" ? error.message : error.toLowerCase();
        const lcMessage = errorMessage.toLowerCase();
        if (lcMessage.indexOf("user denied") > -1) return;
        if (lcMessage.indexOf("transaction failed") > -1) {
          this.gameError[0] = "Transaction Failed.";
          this.gameError[1] = "The state of the game has been reverted.";
        } else {
          this.gameError[0] = errorMessage;
          this.gameError[1] = additionalText;
        }
        this.$modal.show("error");
      },

      showPayTable() {
        this.$modal.show("payTable");
      },

      async solvePendingTransactions() {
        // TEMPORARILY DISABLED
        /*const promise = new Promise((resolve, reject) => {
          const hmyNet = "https://api.s0.b.hmny.io";
          const maxTries = 10;
          let tries = 0;
          const body =
            '{"jsonrpc":"2.0", "method":"hmy_getTransactionByHash","params":["' +
            tx.hash +
            '"], "id":1}';

          const interval = setInterval(async () => {
            tries++;
            if (tries > maxTries) {
              resolve();
            }
            const response = await fetch(hmyNet, {
              method: "POST",
              mode: "cors",
              cache: "no-cache",
              headers: {
                "Content-Type": "application/json",
              },
              body: body,
            });
            const txResponse = await response.json();
            if (
              txResponse.result.blockHash !== null &&
              txResponse.result.blockNumber != null
            ) {
              clearInterval(interval);
              await this.solveGameTransaction(tx);
              resolve();
            }
          }, 2000);
        });*/
      },
    },

    computed: {
      ...mapGetters(["metaMaskAccount", "metaMaskWallet"]),
      isLegalHold() {
        const holdTransactions = this.playerTransactions.filter(
          (c) => c.type === "HOLD"
        );
        const heldReels = this.gameReels.filter((c) => c.isReelHeld);
        return (
          holdTransactions.length < 2 &&
          holdTransactions.length + heldReels.length < 2
        );
      },

      roundFinished() {
        return this.gameReels.filter((c) => c.isSpinning).length === 0;
      },

      isBusy() {
        return (
          this.playerTransactions.filter((c) => c.type !== "SPIN").length > 0
        );
      },

      showNudges() {
        return (
          !this.isBusy &&
          this.playerNudges > 0 &&
          this.roundState === ROUND_STATE.OFF
        );
      },
    },
  };
</script>

<style scoped>
  .screen {
    position: relative;
    background-color: var(--var-slots-dark-bg);
    border-radius: var(--var-border-radius);
    overflow: hidden;
  }

  .screen::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: var(--var-border-radius);
    padding: 1px;
    background: linear-gradient(180deg,
        var(--var-slots-bg),
        var(--var-hilight-strong),
        var(--var-hilight-strong),
        var(--var-hilight-color),
        var(--var-hilight-strong));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    z-index: 15;
  }

  .machine-container {
    position: relative;
    background: linear-gradient(to bottom,
        var(--var-soft-shadow-color) 0%,
        var(--var-slots-bg) 1%,
        var(--var-hilight-color) 30%,
        var(--var-slots-bg) 67%,
        var(--var-soft-shadow-color) 100%);
    border-radius: var(--var-border-radius);
    width: 100%;
    height: 100%;
  }

  .machine-container hr {
    color: var(--var-hilight-strong);
  }

  .machine-container::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: var(--var-border-radius);
    padding: 1px;
    background: linear-gradient(225deg,
        var(--var-hilight-color),
        var(--var-soft-shadow-color),
        var(--var-soft-shadow-color));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }

  .machine-top {
    background: var(--var-slots-bg);
    border-radius: 10px 10px 0 0;
    border: 2px solid var(--var-slots-dark-bg);
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    box-shadow: 0 -1px 1px var(--var-slots-dark-bg);
    height: 20px;
    left: 0;
    position: absolute;
    top: -2px;
    width: 100%;
    z-index: 0;
  }

  .machine-bottom {
    background: var(--var-slots-dark-bg);
    border-radius: 0 0 10px 10px;
    border: 2px solid var(--var-shadow-soft-color);
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    box-shadow: 0 -1px 1px var(--var-slots-dark-bg);
    height: 20px;
    left: 0;
    position: absolute;
    bottom: -12px;
    width: 100%;
    z-index: 0;
  }

  .screen-glass {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 55%,
        #ffffff30,
        #ffffff15 50%,
        #ffffff15 75%,
        #ffffff15 75%);
    opacity: 0.5;
    backdrop-filter: blur(0.25px);
    position: absolute;
    z-index: 25;
  }

  .screen-cover {
    width: 100%;
    height: 100%;
    background: var(--var-slots-dark-bg);
    opacity: 0.95;
    backdrop-filter: blur(0.25px);
    position: absolute;
    z-index: 25;
  }

  .screen-shadow {
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(to bottom,
        rgba(0, 0, 0, 0.8) 0%,
        rgba(0, 0, 0, 0) 15%,
        rgba(0, 0, 0, 0) 50%,
        rgba(0, 0, 0, 0) 85%,
        rgba(0, 0, 0, 0.8) 100%);
    height: 100%;
    width: 100%;
    z-index: 5;
    border-radius: 12px;
  }

  .screen.small {
    width: 200px;
    height: 300px;
  }

  .screen.medium {
    width: 350px;
    height: 210px;
  }

  .screen.large {
    width: 400px;
    height: 600px;
  }

  .nudge-button {
    position: relative;
    color: white;
    cursor: pointer;
    font-size: 12px;
    height: 24px;
    width: 96px;
    text-align: center;
    line-height: 24px;
    border-radius: 12px;
    background: linear-gradient(0deg,
        var(--var-soft-shadow-color),
        var(--var-slots-bg) 10%,
        var(--var-hilight-color));
  }

  .nudge-button:hover {
    text-shadow: 0px 0px 6px white;
  }

  .nudge-button:after {
    position: absolute;
    content: "";
    background: linear-gradient(180deg,
        var(--var-shadow-color) 0%,
        var(--var-slots-bg) 50%,
        var(--var-hilight-color) 35%);
    height: 60px;
    width: 20px;
    left: calc(50% - 10px);
    z-index: -1;
  }

  .slot-trigger {
    width: 80px;
    height: 160px;
    position: absolute;
    right: -80px;
    display: flex;
    align-items: center;
  }

  .slot-ring-1 {
    background: linear-gradient(to bottom,
        var(--var-soft-shadow-color) 0%,
        var(--var-slots-bg) 14%,
        var(--var-slots-bg) 14%,
        var(--var-hilight-color) 30%,
        var(--var-slots-bg) 67%,
        var(--var-soft-shadow-color) 100%);
    -moz-border-radius: 0 2px 2px 0;
    -webkit-border-radius: 0 2px 2px 0;
    border-radius: 0 2px 2px 0;
    -moz-box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.8);
    -webkit-box-shadow: inset 0 2px 3px rgb(0 0 0 / 80%);
    box-shadow: inset 0 2px 3px rgb(0 0 0 / 80%);
    height: 100%;
    left: 0;
    width: 16px;
    z-index: 2;
  }

  .slot-ring-2 {
    background: linear-gradient(to bottom,
        var(--var-soft-shadow-color) 0%,
        var(--var-slots-bg) 14%,
        var(--var-slots-bg) 14%,
        var(--var-hilight-color) 30%,
        var(--var-slots-bg) 67%,
        var(--var-soft-shadow-color) 100%);
    -moz-border-radius: 0 2px 2px 0;
    -webkit-border-radius: 0 2px 2px 0;
    border-radius: 0 2px 2px 0;
    -moz-box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.8);
    -webkit-box-shadow: inset 0 2px 3px rgb(0 0 0 / 80%);
    box-shadow: inset 0 2px 3px rgb(0 0 0 / 80%);
    height: 80%;
    left: 0;
    width: 40px;
    z-index: 2;
    animation: ring-spin 0.5s ease-in infinite;
  }

  .slot-handle {
    position: absolute;
    background: #0d0d0d;
    background: linear-gradient(to right,
        #0d0d0d 0%,
        #4e4e4e 47%,
        #383838 87%,
        #1b1b1b 100%);
    -moz-border-radius: 0 0 4px 4px;
    -webkit-border-radius: 0 0 4px 4px;
    border-radius: 0 0 4px 4px;
    box-shadow: inset 0 2px 5px rgb(0 0 0 / 80%);
    height: 128px;
    left: calc(25% + 12px);
    top: -96px;
    width: 12px;
    z-index: 3;
    overflow: visible !important;
  }

  .slot-knob {
    position: absolute;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: radial-gradient(ellipse at 60% 20%,
        var(--var-hilight-color) 0%,
        var(--var-slots-dark-bg) 100%);
    left: -18px;
    cursor: pointer;
  }

  .slot-knob::after {
    content: "";
    position: absolute;
    bottom: -4px;
    height: 4px;
    left: calc(50% - 6px);
    width: 12px;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .slot-knob::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    padding: 1px;
    background: linear-gradient(225deg,
        var(--var-hilight-color),
        var(--var-soft-shadow-color),
        var(--var-soft-shadow-color));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }

  .ring-shadow {
    background: linear-gradient(to bottom,
        var(--var-hilight-color) 25%,
        var(--var-slots-bg) 75%);
    height: 60%;
    width: 100%;
    position: relative;
    top: 0;
    opacity: 0;
  }

  .shadow-anim {
    animation: shadow-spin 1s ease-in;
  }

  .handle-anim {
    animation: slot-spin 1s ease-in;
  }

  @keyframes slot-spin {
    0% {
      height: 128px;
      top: -96px;
    }

    50% {
      height: 16px;
      top: 64px;
    }
  }

  @keyframes shadow-spin {
    0% {
      opacity: 0;
      top: 0px;
    }

    50% {
      opacity: 0.5;
      top: 30%;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  .nudge-enter-active,
  .nudge-leave-active {
    transition: all 0.25s;
  }

  .nudge-enter,
  .nudge-leave-to {
    transform: translateY(50px);
  }
</style>