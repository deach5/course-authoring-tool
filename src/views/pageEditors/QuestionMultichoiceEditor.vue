<script setup>
// This is a placeholder component for editing the type-specific content of a Question Multichoice page.

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

// This component will be responsible for editing the TYPE-SPECIFIC fields
// within pageData.value.content (e.g., `menuItems`, `items`, `panels`, `options`).
// It should emit an 'update:pageData' event if it modifies the data passed via prop
// OR directly mutate properties if using Vue 3 reactivity proxy (less recommended pattern, prop update is cleaner)
// Let's plan to emit updates for now.

// --- Methods to update content and emit changes ---
const emitUpdate = (updatedContentData) => {
  const updatedPageData = {
    ...props.pageData,
    content: {
      ...props.pageData.content, // Preserve other content fields not managed here
      ...updatedContentData // Apply specific changes for this editor
    }
  };
  emit('update:pageData', updatedPageData);
};

const updateField = (fieldName, value) => {
  emitUpdate({ [fieldName]: value });
};

const addOption = () => {
  const newOption = { id: uuidv4(), text: '', isCorrect: false };
  const updatedOptions = [...(content.value.options || []), newOption];
  emitUpdate({ options: updatedOptions });
};

const removeOption = (optionId) => {
  const updatedOptions = (content.value.options || []).filter(opt => opt.id !== optionId);
  emitUpdate({ options: updatedOptions });
};

const updateOptionText = (optionId, newText) => {
  const updatedOptions = (content.value.options || []).map(opt =>
    opt.id === optionId ? { ...opt, text: newText } : opt
  );
  emitUpdate({ options: updatedOptions });
};

const updateOptionCorrect = (optionId, checked) => {
  const updatedOptions = (content.value.options || []).map(opt =>
    opt.id === optionId ? { ...opt, isCorrect: checked } : opt
  );
  emitUpdate({ options: updatedOptions });
};

const updateTryAgain = (enabled) => {
  const updates = { enableTryAgain: enabled };
  if (!enabled) {
    updates.tryAgainAttempts = 0; // Reset attempts if disabled
  }
  emitUpdate(updates);
};

const updateTryAgainAttempts = (count) => {
  const newCount = parseInt(count, 10);
  if (!isNaN(newCount) && newCount >= 0) {
    emitUpdate({ tryAgainAttempts: newCount });
  } else if (count === '' || count === null) { // Allow clearing the input
     emitUpdate({ tryAgainAttempts: 0 });
  }
};

</script>

<template>
  <!-- 
    This is the type-specific editor section for Question Multichoice pages.
    Common fields (Heading, Initial Text, Disable Next) are handled in the parent PageEditor.vue.
    This section will contain the UI to edit fields specific to this page type 
    (e.g., managing menu items, accordion items, question options, etc.).
  -->
  <div class="question-multichoice-editor">
    <h4>Question Specific Content</h4>

    <!-- Question Text Section -->
    <div class="form-group">
      <label for="questionText">Question Prompt:</label>
      <WysiwygEditor 
        id="questionText" 
        :modelValue="content.questionText || ''"
        @update:modelValue="updateField('questionText', $event)"
      />
    </div>

    <!-- Answer Options Section -->
    <div class="form-group options-group">
      <h5>Answer Options</h5>
      <button @click="addOption" class="add-option-btn">Add Option</button>
      <ul v-if="content.options && content.options.length" class="options-list">
        <li v-for="(option, index) in content.options" :key="option.id" class="option-item">
          <div class="option-controls">
            <input 
              type="checkbox" 
              :id="'correct-' + option.id" 
              :checked="option.isCorrect" 
              @change="updateOptionCorrect(option.id, $event.target.checked)"
              class="option-checkbox"
            />
            <label :for="'correct-' + option.id" class="option-check-label">Correct</label>
          </div>
          <div class="option-text-editor">
            <WysiwygEditor 
              :id="'option-text-' + option.id" 
              :modelValue="option.text || ''"
              @update:modelValue="updateOptionText(option.id, $event)"
              placeholder="Enter option text"
            />
          </div>
          <button @click="removeOption(option.id)" class="remove-option-btn">Remove</button>
        </li>
      </ul>
      <p v-else class="no-options-message">No options added yet.</p>
    </div>

    <!-- Feedback Section -->
    <div class="form-group feedback-group">
      <h5>Feedback</h5>
      <div class="feedback-item">
        <label for="correctFeedback">Correct Answer Feedback:</label>
        <WysiwygEditor 
          id="correctFeedback" 
          :modelValue="content.correctFeedback || ''"
          @update:modelValue="updateField('correctFeedback', $event)"
        />
      </div>
      <div class="feedback-item">
        <label for="incorrectFeedback">Incorrect Answer Feedback:</label>
        <WysiwygEditor 
          id="incorrectFeedback" 
          :modelValue="content.incorrectFeedback || ''"
          @update:modelValue="updateField('incorrectFeedback', $event)"
        />
      </div>
    </div>

    <!-- Try Again Settings Section -->
    <div class="form-group try-again-group">
      <h5>Try Again Settings</h5>
      <div class="try-again-toggle">
        <input 
          type="checkbox" 
          :id="'enableTryAgain-' + props.pageData.id" 
          :checked="content.enableTryAgain || false" 
          @change="updateTryAgain($event.target.checked)"
          class="try-again-checkbox"
        />
        <label :for="'enableTryAgain-' + props.pageData.id">Allow learner to try again</label>
      </div>
      <div v-if="content.enableTryAgain" class="try-again-attempts">
        <label :for="'tryAgainAttempts-' + props.pageData.id">Number of attempts (0 for unlimited):</label>
        <input 
          type="number" 
          :id="'tryAgainAttempts-' + props.pageData.id" 
          :value="content.tryAgainAttempts || 0" 
          @input="updateTryAgainAttempts($event.target.value)"
          min="0"
          class="attempts-input"
        />
      </div>
    </div>

  </div>
</template>

<style scoped>
.question-multichoice-editor {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 25px;
}

.form-group h5 {
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  color: #333;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #444;
}

.add-option-btn {
  background-color: #5cb85c; /* Green variant */
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 15px;
  font-size: 0.9em;
}
.add-option-btn:hover {
  background-color: #4cae4c;
}

.options-list {
  list-style: none;
  padding: 0;
}

.option-item {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  background-color: #fff;
  display: grid;
  grid-template-areas:
    "controls text editor"
    "controls actions actions";
  grid-template-columns: auto 1fr auto;
  gap: 10px 15px;
  align-items: start;
}

.option-controls {
  grid-area: controls;
  display: flex;
  flex-direction: column; /* Stack checkbox and label */
  align-items: center; /* Center checkbox */
  margin-right: 10px; /* Space next to the checkbox */
  font-size: 0.9em;
}

.option-checkbox {
  margin-bottom: 5px; /* Space between checkbox and its label */
  transform: scale(1.2); /* Make checkbox slightly larger */
}
.option-check-label {
  font-weight: normal;
  font-size: 0.85em;
  color: #555;
}

.option-text-editor {
  grid-area: editor; /* Updated grid area name from text to editor */
  flex-grow: 1;
}

.remove-option-btn {
  grid-area: actions; /* Updated grid area name */
  background-color: #d9534f; /* Red variant */
  color: white;
  padding: 6px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.85em;
  justify-self: end; /* Align button to the right */
  align-self: center; /* Center vertically within its grid cell */
}
.remove-option-btn:hover {
  background-color: #c9302c;
}

.no-options-message {
  font-style: italic;
  color: #757575;
}

.feedback-item {
  margin-bottom: 15px;
}

.try-again-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.try-again-checkbox {
  margin-right: 8px;
  transform: scale(1.1);
}

.try-again-attempts label {
  font-size: 0.9em;
  font-weight: normal;
  color: #555;
}

.attempts-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-top: 5px;
}

/* Ensure WysiwygEditor placeholder is visible if its content is empty */
:deep(.wysiwyg-placeholder) {
  min-height: 80px; /* Adjust as needed */
}

</style> 