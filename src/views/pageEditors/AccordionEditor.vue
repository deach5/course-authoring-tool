<script setup>
// This is a placeholder component for editing the type-specific content of a Accordion page.

import { computed, defineEmits } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import WysiwygEditor from '../../components/WysiwygEditor.vue';

// Define the prop that will receive the page data from PageEditor.vue
const props = defineProps({
  // We expect the entire pageData object
  pageData: {
    type: Object,
    required: true
  }
});

// Define Emits
const emit = defineEmits(['update:pageData']);

// We can use a computed property to easily access the content data,
// specifically the part relevant to this page type (e.g., pageData.value.content.menuItems)
// although for now we just access the general content object.
const content = computed(() => props.pageData.content || {});

// Access Accordion Items
const accordionItems = computed(() => props.pageData.content?.items || []);

// Item Management Methods
const addAccordionItem = () => {
  const newItem = { id: uuidv4(), header: 'New Header', body: '' };
  const updatedItems = [...accordionItems.value, newItem];
  const updatedPageData = {
    ...props.pageData,
    content: {
      ...props.pageData.content,
      items: updatedItems
    }
  };
  emit('update:pageData', updatedPageData);
};

const removeAccordionItem = (itemId) => {
  const updatedItems = accordionItems.value.filter(item => item.id !== itemId);
  const updatedPageData = {
    ...props.pageData,
    content: {
      ...props.pageData.content,
      items: updatedItems
    }
  };
  emit('update:pageData', updatedPageData);
};

const updateAccordionItem = (itemId, field, value) => {
  const updatedItems = accordionItems.value.map(item =>
    item.id === itemId ? { ...item, [field]: value } : item
  );
  const updatedPageData = {
    ...props.pageData,
    content: {
      ...props.pageData.content,
      items: updatedItems
    }
  };
  emit('update:pageData', updatedPageData);
};

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
    This is the type-specific editor section for Accordion pages.
    Common fields (Heading, Initial Text, Disable Next) are handled in the parent PageEditor.vue.
    This section will contain the UI to edit fields specific to this page type 
    (e.g., managing menu items, accordion items, question options, etc.).
  -->
  <div class="accordion-editor">
    <h4>Accordion Page Specific Content</h4>
    <button @click="addAccordionItem" class="add-item-btn">Add Accordion Item</button>

    <div v-if="accordionItems.length === 0" class="no-items-message">
      <p>No accordion items yet. Click "Add Accordion Item" to create one.</p>
    </div>

    <ul v-else class="accordion-items-list">
      <li v-for="(item, index) in accordionItems" :key="item.id" class="accordion-item">
        <div class="item-header">
          <label :for="'header-' + item.id">Item #{{ index + 1 }} Header:</label>
          <input 
            :id="'header-' + item.id"
            type="text" 
            :value="item.header" 
            @input="updateAccordionItem(item.id, 'header', $event.target.value)"
            placeholder="Enter item header"
            class="header-input"
          />
        </div>
        
        <div class="item-body">
          <label :for="'body-' + item.id">Item #{{ index + 1 }} Body:</label>
          <WysiwygEditor
            :id="'body-' + item.id"
            :modelValue="item.body"
            @update:modelValue="updateAccordionItem(item.id, 'body', $event)"
          />
        </div>

        <button @click="removeAccordionItem(item.id)" class="remove-item-btn">Remove Item #{{ index + 1 }}</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.accordion-editor {
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.add-item-btn {
  background-color: #4CAF50;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}
.add-item-btn:hover {
  background-color: #45a049;
}

.no-items-message p {
  color: #757575;
  font-style: italic;
  text-align: center;
}

.accordion-items-list {
  list-style: none;
  padding: 0;
}

.accordion-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.accordion-item label {
  display: block;
  font-size: 0.9em;
  font-weight: bold;
  margin-bottom: 6px;
  color: #333;
}

.header-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-sizing: border-box;
  margin-bottom: 10px;
}

/* WysiwygEditor styling is handled by its own component or globally */

.remove-item-btn {
  background-color: #f44336; /* Red */
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.9em;
  margin-top: 10px;
}
.remove-item-btn:hover {
  background-color: #e53935;
}
</style> 