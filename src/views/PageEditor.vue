<template>
  <div v-if="pageData" class="page-editor">
    <h2>Editing: {{ pageData.title }} ({{ pageData.page_type }})</h2>

    <div class="form-section">
      <label for="page-heading">Heading:</label>
      <input type="text" id="page-heading" v-model="pageData.content.heading" />
    </div>

    <div class="form-section">
      <label for="page-initial-text">Initial Text:</label>
      <WysiwygEditor id="page-initial-text" v-model="pageData.content.initialText" />
    </div>

    <!-- Common options like disable_next -->
    <div v-if="isInteractivePage" class="form-section interactive-options">
      <label>
        <input type="checkbox" v-model="pageData.disable_next" />
        Disable 'Next' button until complete
      </label>
    </div>

    <!-- Dynamic Type-Specific Editor -->
    <div class="type-specific-editor-container">
      <p>TEST</p>
      <component
        :is="dynamicEditorComponent"
        v-if="dynamicEditorComponent && pageData.content" 
        :page-data="pageData" 
        @update:pageData="handlePageDataUpdate" 
      />
      <p v-else-if="pageData && pageData.page_type && !dynamicEditorComponent">
        Editor for '{{ pageData.page_type }}' not implemented yet.
      </p>
      <p v-else-if="pageData && !pageData.content">
        Page content not initialized properly.
      </p>
    </div>

    <div class="action-buttons">
      <button @click="savePageChanges" class="save-button">Save Page</button>
      <button @click="goBackToPageManager" class="cancel-button">Cancel</button>
    </div>
  </div>
  <div v-else class="page-not-found">
    <p>Page not found or still loading...</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '../stores/courseStore';
import WysiwygEditor from '../components/WysiwygEditor.vue';
import { v4 as uuidv4 } from 'uuid';

// Dynamically import type-specific editors using defineAsyncComponent
const StaticEditor = defineAsyncComponent(() => import('./pageEditors/StaticEditor.vue'));
const MenuEditor = defineAsyncComponent(() => import('./pageEditors/MenuEditor.vue'));
const AccordionEditor = defineAsyncComponent(() => import('./pageEditors/AccordionEditor.vue'));
const CarouselEditor = defineAsyncComponent(() => import('./pageEditors/CarouselEditor.vue'));
const ClickrevealEditor = defineAsyncComponent(() => import('./pageEditors/ClickrevealEditor.vue'));
const QuestionMultichoiceEditor = defineAsyncComponent(() => import('./pageEditors/QuestionMultichoiceEditor.vue'));

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
const pageData = ref(null);

// Computed Properties
const currentPage = computed(() => {
  if (!courseStore.currentCourse) return null;
  return courseStore.pageById(props.pageId);
});

const isInteractivePage = computed(() => {
  if (!pageData.value) return false; // Use pageData for local state consistency
  const interactiveTypes = ['accordion', 'carousel', 'clickreveal', 'question_multichoice'];
  return interactiveTypes.includes(pageData.value.page_type);
});

const dynamicEditorComponent = computed(() => {
  if (!pageData.value || !pageData.value.page_type) {
    return null;
  }
  switch (pageData.value.page_type) {
    case 'static': return StaticEditor;
    case 'menu': return MenuEditor;
    case 'accordion': return AccordionEditor;
    case 'carousel': return CarouselEditor;
    case 'clickreveal': return ClickrevealEditor;
    case 'question_multichoice': return QuestionMultichoiceEditor;
    default: return null; // Or a default placeholder component
  }
});

// Functions
const loadPageDataForEditor = () => {
  if (currentPage.value) {
    // Deep copy for local editing
    pageData.value = JSON.parse(JSON.stringify(currentPage.value));
    // Ensure content object exists if not present
    if (!pageData.value.content) {
      console.warn(`PageEditor: Page ID ${props.pageId} loaded without a content object. Initializing.`);
      pageData.value.content = { heading: '', initialText: '' }; 
    }

    // Ensure type-specific fields for question_multichoice are present
    if (pageData.value.page_type === 'question_multichoice') {
      if (typeof pageData.value.content.questionText === 'undefined') {
        pageData.value.content.questionText = '';
      }
      if (!Array.isArray(pageData.value.content.options)) {
        // Default to 2 empty options if completely missing, as per store initialization for new pages
        pageData.value.content.options = [
          { id: uuidv4(), text: '', isCorrect: false },
          { id: uuidv4(), text: '', isCorrect: false }
        ];
      } else {
        // Ensure existing options have an id (for pages created before options had ids perhaps)
        pageData.value.content.options = pageData.value.content.options.map(opt => ({
          ...opt,
          id: opt.id || uuidv4()
        }));
      }
      if (typeof pageData.value.content.correctFeedback === 'undefined') {
        pageData.value.content.correctFeedback = '';
      }
      if (typeof pageData.value.content.incorrectFeedback === 'undefined') {
        pageData.value.content.incorrectFeedback = '';
      }
      if (typeof pageData.value.content.enableTryAgain === 'undefined') {
        pageData.value.content.enableTryAgain = false;
      }
      if (typeof pageData.value.content.tryAgainAttempts === 'undefined') {
        pageData.value.content.tryAgainAttempts = 0;
      }
    }

    // Ensure disable_next exists for interactive pages, defaulting to false
    if (isInteractivePage.value && typeof pageData.value.disable_next === 'undefined') {
      pageData.value.disable_next = false;
    }
  } else {
    pageData.value = null;
  }
};

const handlePageDataUpdate = (updatedPageDataObject) => {
  // This assumes the child component emits the entire pageData object
  // For more granular updates, child components could emit specific content parts
  pageData.value = updatedPageDataObject;
};

const savePageChanges = () => {
  if (!pageData.value || !pageData.value.content) {
    console.error('PageEditor: No page data or content to save.');
    return;
  }
  
  // The content object itself will be updated by the dynamic child editors via handlePageDataUpdate
  const contentToSave = pageData.value.content;
  let disableNextToSave = undefined;

  if (isInteractivePage.value) {
    disableNextToSave = !!pageData.value.disable_next; // Ensure boolean
  }

  courseStore.updatePageContent(props.pageId, contentToSave, disableNextToSave);
  // console.log('Page changes saved!');
  // Optionally, navigate back or show success notification
};

const goBackToPageManager = () => {
  router.push({
    name: 'PageManager',
    params: {
      courseId: props.courseId,
      topicId: props.topicId,
    }
  });
};

// Watchers
watch(() => props.pageId, loadPageDataForEditor, { immediate: true });
watch(
  () => courseStore.currentCourse,
  (newCourse, oldCourse) => {
    // Reload if the course structure changed significantly or pageId is now valid
    if (newCourse && (!oldCourse || newCourse.course_id !== oldCourse.course_id || !pageData.value)) {
      loadPageDataForEditor();
    }
  },
  { deep: true }
);

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

.form-section input[type="text"] {
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

.type-specific-editor-container {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  background-color: #f0f0f0;
  min-height: 100px; /* Give some space for the editor */
}

.type-specific-editor-container p {
  color: #757575;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.save-button,
.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.save-button {
  background-color: #4CAF50;
  color: white;
}

.save-button:hover {
  background-color: #45a049;
}

.cancel-button {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

.page-not-found {
  padding: 20px;
  text-align: center;
  color: #757575;
}
</style>

 