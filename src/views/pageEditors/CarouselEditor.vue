<script setup>
// This is a placeholder component for editing the type-specific content of a Carousel page.

import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { defineEmits } from 'vue';
import WysiwygEditor from '../../components/WysiwygEditor.vue';

// Define the prop that will receive the page data from PageEditor.vue
const props = defineProps({
  // We expect the entire pageData object
  pageData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:pageData']);

// Access the carousel panels array
const carouselPanels = computed(() => props.pageData.content?.panels || []);

// Add a new carousel panel
const addCarouselPanel = () => {
  const newPanel = {
    id: uuidv4(),
    body: ''
  };
  
  const updatedPageData = { ...props.pageData };
  updatedPageData.content = {
    ...updatedPageData.content,
    panels: [...carouselPanels.value, newPanel]
  };
  
  emit('update:pageData', updatedPageData);
};

// Remove a carousel panel
const removeCarouselPanel = (panelId) => {
  const updatedPageData = { ...props.pageData };
  updatedPageData.content = {
    ...updatedPageData.content,
    panels: carouselPanels.value.filter(panel => panel.id !== panelId)
  };
  
  emit('update:pageData', updatedPageData);
};

// Update a panel's body content
const updateCarouselPanelBody = (panelId, newBody) => {
  const updatedPageData = { ...props.pageData };
  updatedPageData.content = {
    ...updatedPageData.content,
    panels: carouselPanels.value.map(panel => {
      if (panel.id === panelId) {
        return { ...panel, body: newBody };
      }
      return panel;
    })
  };
  
  emit('update:pageData', updatedPageData);
};

// We can use a computed property to easily access the content data,
// specifically the part relevant to this page type (e.g., pageData.value.content.menuItems)
// although for now we just access the general content object.
const content = computed(() => props.pageData.content || {});

// This component will be responsible for editing the TYPE-SPECIFIC fields
// within pageData.value.content (e.g., `menuItems`, `items`, `panels`, `options`).
// It should emit an 'update:pageData' event if it modifies the data passed via prop
// OR directly mutate properties if using Vue 3 reactivity proxy (less recommended pattern, prop update is cleaner)
// Let's plan to emit updates for now.

// Example of emitting an update (will be used later when adding functionality):
// const updateContentField = (field, value) => {
//   // Create a shallow copy to trigger reactivity updates nicely
//   const updatedPageData = { ...props.pageData };
//   updatedPageData.content = { ...updatedPageData.content, [field]: value };
//   emit('update:pageData', updatedPageData);
// };

</script>

<template>
  <!-- 
    This is the type-specific editor section for Carousel pages.
    Common fields (Heading, Initial Text, Disable Next) are handled in the parent PageEditor.vue.
    This section will contain the UI to edit fields specific to this page type 
    (e.g., managing menu items, accordion items, question options, etc.).
  -->
  <div class="carousel-editor">
    <h4>Carousel Page Specific Content</h4>
    
    <!-- Add Panel Button -->
    <button class="add-panel-button" @click="addCarouselPanel">
      Add Carousel Panel
    </button>
    
    <!-- List of Carousel Panels -->
    <div class="carousel-panels">
      <div v-for="(panel, index) in carouselPanels" :key="panel.id" class="carousel-panel">
        <!-- Panel Header -->
        <div class="panel-header">
          <h5>Panel {{ index + 1 }}</h5>
          <button 
            class="remove-panel-button"
            @click="removeCarouselPanel(panel.id)"
          >
            Remove Panel
          </button>
        </div>
        
        <!-- Panel Content Editor -->
        <div class="panel-content">
          <label>Panel Content:</label>
          <WysiwygEditor
            :modelValue="panel.body"
            @update:modelValue="updateCarouselPanelBody(panel.id, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel-editor {
  margin-top: 20px;
  padding: 15px;
  border: 1px dashed #ccc; /* Different border style */
  background-color: #e8f5e9; /* Light green background */
}

.add-panel-button {
  margin-bottom: 20px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-panel-button:hover {
  background-color: #45a049;
}

.carousel-panels {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.carousel-panel {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-header h5 {
  margin: 0;
  color: #333;
}

.remove-panel-button {
  padding: 6px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-panel-button:hover {
  background-color: #da190b;
}

.panel-content {
  margin-top: 10px;
}

.panel-content label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
</style> 