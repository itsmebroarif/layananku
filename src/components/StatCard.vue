<template>
  <v-card class="h-100" border>
    <v-card-text class="d-flex align-start justify-space-between">
      <div>
        <div class="text-caption text-medium-emphasis font-weight-medium">{{ label }}</div>
        <div class="text-h5 font-weight-bold mt-1">{{ displayValue }}</div>
        <div v-if="sub" class="text-caption text-medium-emphasis mt-1">{{ sub }}</div>
      </div>
      <v-avatar :color="color" size="44" variant="tonal">
        <v-icon :icon="icon" />
      </v-avatar>
    </v-card-text>
    <v-card-actions v-if="$slots.action" class="pt-0">
      <slot name="action" />
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], default: 0 },
    icon: { type: String, default: 'mdi-chart-box-outline' },
    color: { type: String, default: 'primary' },
    sub: { type: String, default: '' },
    format: { type: Boolean, default: false },
    currency: { type: String, default: 'IDR' }
  },
  computed: {
    displayValue () {
      if (!this.format) return this.value
      try {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: this.currency,
          maximumFractionDigits: this.currency === 'IDR' ? 0 : 2
        }).format(Number(this.value) || 0)
      } catch (e) {
        return this.value
      }
    }
  }
}
</script>
