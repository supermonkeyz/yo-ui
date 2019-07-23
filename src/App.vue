<template>
  <div id="app">
    <div :class="$style.title">测试</div>
  </div>
</template>

<script>
export default {
  name: 'app',
  mounted() {
    console.log('x');
  }
};
</script>

<style lang="postcss" module>
.title {
  color: black;
  font-size: 32px;
  border-bottom: 1px;
  font-family: system-ui;
}
</style>
