<script setup>
// This component will edit the type-specific content for 'static' pages.
// Static pages only use the common heading and initialText,
// so this component can be very simple or even empty for now.

import { computed } from 'vue';

// Define the prop that will receive the page data from PageEditor.vue
const props = defineProps({
  // We expect the entire pageData object, although this editor only uses content
  pageData: {
    type: Object,
    required: true
  }
});

// We can use computed properties to easily access the content data
const content = computed(() => props.pageData.content || {});

// Since this editor doesn't add complex specific fields yet,
// we don't need to emit updates back to the parent for its *specific* content.
// The common fields (heading, initialText) are handled directly in PageEditor.vue.
// We might revisit this if static pages gain more complex content later.

</script>

<template>
  <!-- 
    This is the type-specific editor section for Static pages.
    Static pages primarily use the common Heading and Initial Text fields 
    which are edited in the parent PageEditor.vue.
    This section can be used for any static-specific settings later,
    or can simply be minimal/empty if no other static-specific fields exist.
  -->
  <div class="static-editor">
    <!-- Optional: Add a message indicating this is the static editor -->
    <p>Static Page Specific Options (None yet)</p>
  </div>
</template>

<style scoped>
.static-editor {
  margin-top: 20px;
  padding: 15px;
  border: 1px dashed #ccc;
  background-color: #f9f9f9;
}
</style> 