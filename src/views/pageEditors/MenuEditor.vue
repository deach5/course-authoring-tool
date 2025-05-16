<script setup>
// This is a placeholder component for editing the type-specific content of a Menu page.

import { ref, computed, defineEmits } from 'vue';
import { useCourseStore } from '../../stores/courseStore';
import { v4 as uuidv4 } from 'uuid';
import PageSelectorModal from '../../components/PageSelectorModal.vue';

// Define the prop that will receive the page data from PageEditor.vue
const props = defineProps({
  // We expect the entire pageData object
  pageData: {
    type: Object,
    required: true
  }
});

// Define emits
const emit = defineEmits(['update:pageData']);

const courseStore = useCourseStore();

// Modal State
const isModalOpen = ref(false);
const currentItemIdToLink = ref(null);

// We can use a computed property to easily access the content data,
// specifically the part relevant to this page type (e.g., pageData.value.content.menuItems)
// although for now we just access the general content object.
const content = computed(() => props.pageData.content || {});

// Computed property for easy access and default to empty array
const menuItems = computed(() => props.pageData.content?.menuItems || []);

const getLinkedPageInfo = (targetPageId) => {
  if (!targetPageId) return "(Not linked)";
  if (!courseStore.currentCourse || !courseStore.currentCourse.topics) return "(Course data not loaded)";

  for (const topic of courseStore.currentCourse.topics) {
    const page = topic.pages.find(p => p.id === targetPageId);
    if (page) {
      return `Topic: ${topic.title} -> Page: ${page.title}`;
    }
  }
  return "(Page not found)";
};

const addMenuItem = () => {
  const newItem = { id: uuidv4(), label: 'New Menu Item', targetPageId: null };
  const updatedPageData = {
    ...props.pageData,
    content: {
      ...props.pageData.content,
      menuItems: [...menuItems.value, newItem]
    }
  };
  emit('update:pageData', updatedPageData);
};

const removeMenuItem = (itemId) => {
  const updatedMenuItems = menuItems.value.filter(item => item.id !== itemId);
  const updatedPageData = {
    ...props.pageData,
    content: {
      ...props.pageData.content,
      menuItems: updatedMenuItems
    }
  };
  emit('update:pageData', updatedPageData);
};

const updateMenuItemLabel = (itemId, newLabel) => {
  const updatedMenuItems = menuItems.value.map(item => 
    item.id === itemId ? { ...item, label: newLabel } : item
  );
  const updatedPageData = {
    ...props.pageData,
    content: {
      ...props.pageData.content,
      menuItems: updatedMenuItems
    }
  };
  emit('update:pageData', updatedPageData);
};

const unlinkMenuItemTarget = (itemId) => {
  const updatedMenuItems = menuItems.value.map(item => 
    item.id === itemId ? { ...item, targetPageId: null } : item
  );
  const updatedPageData = {
    ...props.pageData,
    content: {
      ...props.pageData.content,
      menuItems: updatedMenuItems
    }
  };
  emit('update:pageData', updatedPageData);
};

// Updated method to open the modal
const selectTargetPage = (itemId) => {
  currentItemIdToLink.value = itemId;
  isModalOpen.value = true;
};

// Modal Event Handlers
const handlePageSelected = (selectedPageId) => {
  if (currentItemIdToLink.value && selectedPageId) {
    const updatedMenuItems = menuItems.value.map(item => 
      item.id === currentItemIdToLink.value ? { ...item, targetPageId: selectedPageId } : item
    );
    const updatedPageData = {
      ...props.pageData,
      content: {
        ...props.pageData.content,
        menuItems: updatedMenuItems
      }
    };
    emit('update:pageData', updatedPageData);
  }
  currentItemIdToLink.value = null; // Reset after handling
  // isModalOpen will be set to false by the @close binding in the template
};

const handleModalClosed = () => {
    // This specific handler for @close is redundant if we directly set isModalOpen.value = false in template.
    // However, it can be useful for other cleanup if needed.
    currentItemIdToLink.value = null;
    // isModalOpen.value = false; // This is handled by the @close binding on the modal in template
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
    This is the type-specific editor section for Menu pages.
    Common fields (Heading, Initial Text, Disable Next) are handled in the parent PageEditor.vue.
    This section will contain the UI to edit fields specific to this page type 
    (e.g., managing menu items, accordion items, question options, etc.).
  -->
  <div class="menu-editor-wrapper">
    <div class="menu-editor">
      <h4>Menu Page Specific Content</h4>
      
      <button @click="addMenuItem" class="add-item-btn">Add Menu Item</button>

      <div v-if="menuItems.length === 0" class="no-items-message">
        <p>No menu items yet. Click "Add Menu Item" to create one.</p>
      </div>

      <ul v-else class="menu-items-list">
        <li v-for="item in menuItems" :key="item.id" class="menu-item">
          <div class="item-details">
            <div class="item-label-group">
              <label :for="'label-' + item.id">Button Label:</label>
              <input 
                :id="'label-' + item.id"
                type="text" 
                :value="item.label" 
                @input="updateMenuItemLabel(item.id, $event.target.value)"
                placeholder="Enter button label"
                class="label-input"
              />
            </div>
            <div class="item-link-group">
              <label :for="'link-' + item.id">Links To:</label>
              <span :id="'link-' + item.id" class="link-info-text">{{ getLinkedPageInfo(item.targetPageId) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="selectTargetPage(item.id)" class="action-btn link-btn">Select Page</button>
            <button v-if="item.targetPageId" @click="unlinkMenuItemTarget(item.id)" class="action-btn unlink-btn">Unlink</button>
            <button @click="removeMenuItem(item.id)" class="action-btn remove-btn">Remove</button>
          </div>
        </li>
      </ul>
    </div>

    <PageSelectorModal
      :is-open="isModalOpen"
      @select-page="handlePageSelected"
      @close="isModalOpen = false; handleModalClosed();" 
    />
  </div>
</template>

<style scoped>
.menu-editor-wrapper {
  position: relative; /* For modal positioning context if needed, though modal is fixed */
}

.menu-editor {
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #e0e0e0; /* Softer border */
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
  margin-bottom: 20px; /* Increased margin */
}
.add-item-btn:hover {
  background-color: #45a049;
}

.no-items-message p {
  color: #757575;
  font-style: italic;
}

.menu-items-list {
  list-style: none;
  padding: 0;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Align items to the start for multi-line labels */
  padding: 15px; /* Increased padding */
  border: 1px solid #ddd; /* Slightly darker border for items */
  border-radius: 4px;
  margin-bottom: 15px; /* Increased margin */
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column; /* Stack label and link info */
  gap: 12px; /* Increased gap */
  margin-right: 15px; /* Space before action buttons */
}

.item-label-group,
.item-link-group {
  display: flex;
  flex-direction: column;
  gap: 5px; /* Space between label and its control/text */
}

.item-label-group label,
.item-link-group label {
  font-size: 0.85em;
  color: #555;
  font-weight: bold;
}

.label-input {
  padding: 8px 10px; /* Adjusted padding */
  border: 1px solid #ccc;
  border-radius: 3px;
  width: 100%; 
  box-sizing: border-box;
}

.link-info-text {
  font-size: 0.9em;
  color: #333;
  padding: 6px 0; /* Add some padding for alignment */
  min-height: 20px; /* Ensure space even if not linked */
}

.item-actions {
  display: flex;
  flex-direction: column; /* Stack action buttons vertically */
  align-items: flex-start; /* Align buttons to the start */
  gap: 8px;
}

.action-btn {
  padding: 6px 12px; /* Adjusted padding */
  border-radius: 3px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.9em;
  text-align: center;
  min-width: 100px; /* Give buttons a consistent width */
}

.link-btn {
  background-color: #2196F3; /* Blue */
  color: white;
}
.link-btn:hover {
  background-color: #1e88e5;
}

.unlink-btn {
  background-color: #ff9800; /* Orange for unlink */
  color: white;
}
.unlink-btn:hover {
  background-color: #f57c00;
}

.remove-btn {
  background-color: #f44336; /* Red */
  color: white;
}
.remove-btn:hover {
  background-color: #e53935;
}
</style> 