<template lang="html">
  <button :class="$style.main" @click="clickHandle">
    <!-- @slot default slot -->
    <slot />
  </button>
</template>

<script>
export default {
  name: 'yo-button',
  props: {
    /**
     * The kind for the button.
     * `default: line, flat, simple`
     */
    kind: {
      type: String,
      default: 'line'
    }
  },
  methods: {
    clickHandle() {
      /**
       * Click event.
       */
      this.$emit('click');
    }
  }
};
</script>

<style lang="postcss" module>
:root {
}

.main {
  border: 1px solid gray;
}
</style>
