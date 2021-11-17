<template>
  <div class="w-4/12 pt-3 pb-1 h-full reel-mask">
    <div :key='test' class="flex items-center h-full w-full flex-col">
      <div class="absolute reel" v-bind:style="getReelStyle(index)" v-for="(item, index) in reelItems" :key="index">
        <img v-bind:style="getImageClass(index)" v-bind:class="{ 'reel-hold': isReelHeld === true }" class="rounded"
          :width="reelBlockSize * 0.9" :height="reelBlockSize * 0.9" :src="item.image" />
      </div>
    </div>
  </div>
</template>

<script>
  import {
    mapGetters,
    mapActions
  } from "vuex";

  const elasticOut = (x) => {
    const c4 = (2 * Math.PI) / 3;

    return x === 0 ?
      0 :
      x === 1 ?
      1 :
      Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  };

  export default {
    name: "SlotReel",
    props: {
      reelBlockSize: {
        type: Number,
        default: 96,
      },
      updateTrigger: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        reelItems: [],
        reelSpeed: 0,
        reelPosition: 0,
        reelSheet: [],
        reelBounds: 0,
        reelItemCount: 0,
        reelAnimations: {},
        isReelHeld: false,
        isReelSpinning: false,
        keys: {
          loader: 0,
        },
        test: 0
      };
    },
    mounted() {
      this.initializeAnimations();
    },
    watch:{
      updateTrigger(oldVal, newVal){
        this.update(newVal);
      }
    },
    methods: {
      ...mapGetters("exchange", ["getToken"]),
      ...mapActions("exchange", ["resetTokens", "goTo"]),

      update(dt) {
        if (this.reelAnimations.start.running) {
          this.runStartAnimation(dt);
        }
        if (this.reelAnimations.rebound.running) {
          this.runReboundAnimation(dt);
        }
        if (!this.isReelSpinning) return;

        for (let i = 0; i < this.reelItems.length; i++) {
          this.reelItems[i].y -= this.reelSpeed;

         // if (this.reelItems[i].y >= this.reelBounds - this.reelBlockSize) {
         //   this.reelItems[i].y = this.reelItems[i].y - this.reelBounds;
         // }

          if (this.reelItems[i].y <= -this.reelBlockSize) {
            this.reelItems[i].y = this.reelBounds - this.reelBlockSize;
          }
        }
      },

      initializeAnimations() {
        this.reelAnimations = {
          start: {
            running: false,
            timer: 0,
            duration: 0.15,
          },
          rebound: {
            running: false,
            timer: 0,
            duration: 0.3,
            arg: 5,
          },
        };
      },

      runStartAnimation(dt) {
        const animation = this.reelAnimations.start;
        animation.timer += dt;

        for (let i = 0; i < this.reelItems.length; i++) {
          this.reelItems[i].y += 1;
        }
        if (animation.timer >= animation.duration * 1000) {
          animation.timer = 0;
          animation.running = false;
          for (let i = 0; i < this.reelItems.length; i++) {
            this.reelItems[i].y = this.reelItems[i].initialPosition;
          }
          this.resetReel();
          this.isReelSpinning = true;
        }
      },

      runReboundAnimation(dt) {
        const animation = this.reelAnimations.rebound;
        animation.timer += dt;
        const position = elasticOut(
          animation.timer / (1000 / animation.duration)
        );

        for (let i = 0; i < this.reelItems.length; i++) {
          this.reelItems[i].y =
            this.reelItems[i].initialPosition + 
            ((1 - position) * this.reelBlockSize) / animation.arg;
        }
        if (animation.timer >= animation.duration * 1000) {
          animation.timer = 0;
          animation.running = false;
          for (let i = 0; i < this.reelItems.length; i++) {
            this.reelItems[i].y = this.reelItems[i].initialPosition;
          }
        }
      },

      startRound() {
        if (this.isReelHeld) return;
        this.reelAnimations.start.running = true;
        this.reelSpeed = 10;
      },

      resetReel() {
        for (let i = 0; i < this.reelItems.length; i++) {
          this.reelItems[i].initialPosition = i * this.reelBlockSize;
        }
      },

      forceStop(index) {
        this.reelAnimations.rebound.running = true;
        this.isReelSpinning = false;
        this.setFinalPosition(index);
      },

      setReelSheet(reelSheet, assets) {
        if (this.reelSheet.length > 0) return;

        this.reelItemCount = reelSheet.length;
        this.reelSheet = reelSheet;
        this.reelItemCount = this.reelSheet.length;
        this.reelBounds = this.reelItemCount * this.reelBlockSize;

        for (let i = 0; i < this.reelItemCount; i++) {
          this.reelItems.push({
            index: i,
            y: i * this.reelBlockSize,
            initialPosition: i * 96,
            image: assets.images[this.reelSheet[i]],
          });
        }
        this.keys.loader++;
      },

      setFinalPosition(index) {
        if (this.isReelHeld) return;

        this.reelPosition = index;
        this.reelAnimations.rebound.running = true;
        this.isReelSpinning = false;

        const shifts = index - 1 < 0 ? this.reelItemCount - 1 : index - 1;
        for (let i = 0; i < this.reelItems.length; i++) {
          const newPosition = this.reelItems[i].index - shifts;

          if (newPosition < 0) {
            this.reelItems[i].initialPosition =
              (this.reelItemCount + newPosition) * this.reelBlockSize;
          } else {
            this.reelItems[i].initialPosition = newPosition * this.reelBlockSize;
          }
        }
      },

      holdReel() {
        this.isReelHeld = true;
      },

      releaseReel() {
        this.isReelHeld = false;
      },

      stopSpinning() {
        this.reelSpeed = 0;
        this.isReelSpinning = false;
        this.isReelHeld = false;
      },

      getReelStyle(index) {
        return {
          top: -35 + this.reelItems[index].y + "px",
        };
      },
      
      getImageClass() {
        if (!this.isReelSpinning) return "";
        return {
          filter: "blur(8px)",
        };
      },
    },
  };
</script>

<style scoped>
  .reel-hold {
    box-shadow: 0px 0px 16px rgb(212, 69, 69, 1);
  }

  .reel-blur {
    background-color: var(--var-hilight-color);
    opacity: 1;
  }
</style>