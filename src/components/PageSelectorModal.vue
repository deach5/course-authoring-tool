<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import { useCourseStore } from '../stores/courseStore';

// Define Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

// Define Emits
const emit = defineEmits(['select-page', 'close']);

// Access Course Data
const courseStore = useCourseStore();
const currentCourse = computed(() => courseStore.currentCourse);
const topics = computed(() => currentCourse.value?.topics || []);

// Implement Close Logic
const closeModal = () => {
  emit('close');
};

// Implement Selection Logic
const selectPage = (pageId) => {
  emit('select-page', pageId);
  closeModal(); // Close modal after selection
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h3>Select a Page to Link</h3>
      
      <div class="modal-body">
        <div v-if="topics.length === 0" class="no-pages-message">
          <p>No topics or pages available in the current course.</p>
        </div>
        <div v-else class="topics-list">
          <div v-for="topic in topics" :key="topic.id" class="topic-item">
            <h4>{{ topic.title }}</h4>
            <ul v-if="topic.pages && topic.pages.length > 0" class="pages-list">
              <li v-for="page in topic.pages" :key="page.id" class="page-item">
                <button @click="selectPage(page.id)" class="select-page-btn">
                  {{ page.title }} ({{ page.page_type }})
                </button>
              </li>
            </ul>
            <p v-else class="no-pages-in-topic">No pages in this topic.</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.modal-body {
  overflow-y: auto;
  flex-grow: 1;
  margin-bottom: 20px; /* Space before footer */
}

.topics-list {
  list-style: none;
  padding: 0;
}

.topic-item {
  margin-bottom: 15px;
}

.topic-item h4 {
  margin: 0 0 8px 0;
  color: #555;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.pages-list {
  list-style: none;
  padding-left: 10px; /* Indent pages under topic */
}

.page-item {
  margin-bottom: 8px;
}

.select-page-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  color: #333;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-size: 0.95em;
}

.select-page-btn:hover {
  background-color: #e7e7e7;
  border-color: #ccc;
}

.no-pages-message p, .no-pages-in-topic {
  color: #757575;
  font-style: italic;
  text-align: center;
  padding: 10px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  background-color: #6c757d; /* Grey */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #5a6268;
}
</style> 