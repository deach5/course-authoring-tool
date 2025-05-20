<script setup>
// This is a placeholder component for editing the type-specific content of a Clickreveal page.

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

// Access the clickreveal items array
const clickrevealItems = computed(() => props.pageData.content?.items || []);

// Add a new clickreveal item
const addClickrevealItem = () => {
  const newItem = {
    id: uuidv4(),
    buttonLabel: '',
    revealedContent: ''
  };
  
  const updatedPageData = { ...props.pageData };
  updatedPageData.content = {
    ...updatedPageData.content,
    items: [...clickrevealItems.value, newItem]
  };
  
  emit('update:pageData', updatedPageData);
};

// Remove a clickreveal item
const removeClickrevealItem = (itemId) => {
  const updatedPageData = { ...props.pageData };
  updatedPageData.content = {
    ...updatedPageData.content,
    items: clickrevealItems.value.filter(item => item.id !== itemId)
  };
  
  emit('update:pageData', updatedPageData);
};

// Update a specific field of a clickreveal item
const updateClickrevealItem = (itemId, field, value) => {
  const updatedPageData = { ...props.pageData };
  updatedPageData.content = {
    ...updatedPageData.content,
    items: clickrevealItems.value.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
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
    This is the type-specific editor section for Clickreveal pages.
    Common fields (Heading, Initial Text, Disable Next) are handled in the parent PageEditor.vue.
    This section will contain the UI to edit fields specific to this page type 
    (e.g., managing menu items, accordion items, question options, etc.).
  -->
  <div class="clickreveal-editor">
    <h4>Clickreveal Page Specific Content</h4>
    
    <!-- Add Item Button -->
    <button class="add-item-button" @click="addClickrevealItem">
      Add Click & Reveal Item
    </button>
    
    <!-- List of Clickreveal Items -->
    <div class="clickreveal-items">
      <div v-for="item in clickrevealItems" :key="item.id" class="clickreveal-item">
        <!-- Button Label Input -->
        <div class="item-field">
          <label>Button Label:</label>
          <input 
            type="text" 
            :value="item.buttonLabel"
            @input="updateClickrevealItem(item.id, 'buttonLabel', $event.target.value)"
            placeholder="Enter button text"
          />
        </div>
        
        <!-- Revealed Content WYSIWYG Editor -->
        <div class="item-field">
          <label>Revealed Content:</label>
          <WysiwygEditor
            :modelValue="item.revealedContent"
            @update:modelValue="updateClickrevealItem(item.id, 'revealedContent', $event)"
          />
        </div>
        
        <!-- Remove Item Button -->
        <button 
          class="remove-item-button"
          @click="removeClickrevealItem(item.id)"
        >
          Remove Item
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clickreveal-editor {
  margin-top: 20px;
  padding: 15px;
  border: 1px dashed #ccc;
  background-color: #e8f5e9;
}

.add-item-button {
  margin-bottom: 20px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-item-button:hover {
  background-color: #45a049;
}

.clickreveal-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.clickreveal-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.item-field {
  margin-bottom: 15px;
}

.item-field label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.item-field input[type="text"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.remove-item-button {
  padding: 6px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-item-button:hover {
  background-color: #da190b;
}
</style> 