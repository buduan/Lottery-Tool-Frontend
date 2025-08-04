<template>
  <div>
    <h3 class="text-2xl font-bold" v-if="title">{{ title }}</h3>
    <h5 class="text-sm text-slate-400 pt-1" v-if="subTitle">
      {{ subTitle }}
    </h5>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subTitle?: string
}>();
</script>