<template>
  <div v-on:click="onClick()" v-bind:class="{ pressed: pressed }" class="slots-button text-center rounded-xl">
    <div>
      <span>{{ title }}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "SlotButton",
    props: {
      title: {
        type: String,
        default: "Text",
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        gameLoop: null,
        reels: [],
        pressed: false,
      };
    },
    mounted() {},
    methods: {
      onClick() {
        if (this.disabled) return;
        this.pressed = !this.pressed;
        this.$emit("buttonClick", this.validateButtonClick);
      },

      pressButton() {
        this.pressed = true;
      },

      releaseButton() {
        this.pressed = false;
      },
      
      validateButtonClick(valid) {
        if (!valid) this.pressed = !this.pressed;
      },
    },
    computed: {},
  };
</script>

<style scoped>
  .slots-button {
    cursor: pointer;
    position: relative;
    background-color: var(--var-soft-shadow-color);
    color: white;
    text-shadow: 2px 2px --var-soft-shadow-color;
    min-height: 48px;
    min-width: 80px;
    width: 100%;
    height: 100%;
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;
    border-radius: 24px;
    -moz-box-shadow: inset 0 0 6px var(--var-shadow-color);
    -webkit-box-shadow: inset 0 0 6px var(--var-shadow-color);
    box-shadow: inset 0 0 6px var(--var-shadow-color);
    text-shadow: 2px 2px 10px var(--var-hilight-color);
    transform: rotate3d(1, 0, 0, 41deg);
    border-bottom: 12px solid var(--var-slots-dark-bg);
  }

  .slots-button:hover {
    background-color: var(--var-hilight-color);
  }

  .slots-button.pressed {
    background-color: var(--var-slots-bg);
    border-bottom: 0;
    border-top: 9px solid var(--var-slots-dark-bg);
    transform: rotate3d(1, 0, 0, 45deg);
    color: rgba(255, 255, 255, 0.75);
  }

  .slots-button p {
    color: var(--var-hilight-color);
  }

  .slots-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(225deg,
        var(--var-hilight-color),
        var(--var-soft-shadow-color));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }

  .slots-button.pressed::before {
    background: linear-gradient(45deg,
        var(--var-hilight-color),
        var(--var-soft-shadow-color),
        var(--var-soft-shadow-color));
  }
</style>