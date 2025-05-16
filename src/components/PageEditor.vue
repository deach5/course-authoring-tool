<template>
  <div v-if="pageData" class="page-editor">
    <h2>Editing: {{ pageData.title }}</h2>

    <div class="form-section">
      <label for="page-heading">Heading:</label>
      <input type="text" id="page-heading" v-model="pageData.content.heading" />
    </div>

    <div class="form-section">
      <label for="page-initial-text">Initial Text:</label>
      <WysiwygEditor id="page-initial-text" v-model="pageData.content.initialText" />
    </div>

    <!-- Placeholder for type-specific editor sections -->
    <div class="type-specific-editor">
      <p><em>Type-specific editor for '{{ pageData.page_type }}' will go here.</em></p>
    </div>

    <div v-if="isInteractivePage" class="form-section interactive-options">
      <label>
        <input type="checkbox" v-model="pageData.disable_next" />
        Disable 'Next' button until complete
      </label>
    </div>

    <button @click="savePageChanges" class="save-button">Save Page</button>
  </div>
  <div v-else class="page-not-found">
    <p>Page not found or still loading...</p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCourseStore } from '../stores/courseStore';
import WysiwygEditor from '../components/WysiwygEditor.vue';

// Props
const props = defineProps({
  courseId: { type: String, required: true },
  topicId: { type: String, required: true },
  pageId: { type: String, required: true },
});

// Instances
const router = useRouter();
const courseStore = useCourseStore();

// Reactive State
const pageData = ref(null); // Holds a deep copy of the page for editing

// Computed Properties
const currentPage = computed(() => {
  if (!courseStore.currentCourse) return null;
  // Using pageById getter for efficiency if available and correct
  return courseStore.pageById(props.pageId);
});

const isInteractivePage = computed(() => {
  if (!currentPage.value) return false;
  const interactiveTypes = ['accordion', 'carousel', 'clickreveal', 'question_multichoice'];
  return interactiveTypes.includes(currentPage.value.page_type);
});

// Functions
const loadPageDataForEditor = () => {
  if (currentPage.value) {
    // Create a deep copy to avoid direct mutation of store state
    pageData.value = JSON.parse(JSON.stringify(currentPage.value));
    // Ensure content object exists
    if (!pageData.value.content) {
      pageData.value.content = { heading: '', initialText: '' };
    }
    // Ensure disable_next exists for interactive pages, default to false if not present
    if (isInteractivePage.value && typeof pageData.value.disable_next === 'undefined') {
      pageData.value.disable_next = false;
    }

  } else {
    pageData.value = null;
    // console.warn(`PageEditor: Page with ID ${props.pageId} not found in store.`);
    // Optionally, navigate away or show a more permanent error
    // For now, v-else in template handles display
  }
};

const savePageChanges = () => {
  if (!pageData.value || !pageData.value.content) {
    console.error('PageEditor: No page data or content to save.');
    return;
  }
  
  const contentToSave = pageData.value.content;
  let disableNextToSave = undefined;

  if (isInteractivePage.value) {
    disableNextToSave = !!pageData.value.disable_next; // Ensure boolean
  }

  courseStore.updatePageContent(props.pageId, contentToSave, disableNextToSave);
  // Maybe add a success notification here
  // console.log('Page changes saved!');
};

// Watchers
watch(() => props.pageId, loadPageDataForEditor, { immediate: true });

// Also watch for changes in the currentCourse in case it's loaded asynchronously
// or the underlying page object changes externally (e.g., after import)
watch(() => courseStore.currentCourse, loadPageDataForEditor, { deep: true });

</script>

<style scoped>
.page-editor {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-section {
  margin-bottom: 20px;
}

.form-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-section input[type="text"],
.form-section textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.interactive-options label {
  display: flex;
  align-items: center;
  font-weight: normal;
}

.interactive-options input[type="checkbox"] {
  margin-right: 8px;
}

.save-button {
  padding: 10px 20px;
  background-color: #4CAF50; /* Green */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.save-button:hover {
  background-color: #45a049;
}

.page-not-found {
  padding: 20px;
  text-align: center;
  color: #757575;
}

.type-specific-editor {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  background-color: #f0f0f0;
}
</style> 