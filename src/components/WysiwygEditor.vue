<template>
  <!-- Placeholder for WYSIWYG editor -->
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="wysiwyg-placeholder"
  ></textarea>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// Define props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

// Define emits
const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.wysiwyg-placeholder {
  width: 100%;
  height: 150px; /* Adjust as needed */
  border: 1px solid #ccc;
  padding: 8px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
}
</style> 