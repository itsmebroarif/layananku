<template>
  <div class="text-center py-10 px-4">
    <v-icon :icon="icon" :size="size" color="grey-lighten-1" class="mb-3" />
    <div class="text-body-1 font-weight-medium text-medium-emphasis">{{ title }}</div>
    <div v-if="text" class="text-body-2 text-grey mt-1">{{ text }}</div>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: { type: String, default: 'mdi-inbox-outline' },
    title: { type: String, required: true },
    text: { type: String, default: '' },
    size: { type: [Number, String], default: 56 }
  }
}
</script>
