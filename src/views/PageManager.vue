<script setup>
import { ref, computed } from 'vue'
import { useCourseStore } from '../stores/courseStore'
import { useRouter } from 'vue-router'

const props = defineProps({
  courseId: {
    type: String,
    required: true
  },
  topicId: {
    type: String,
    required: true
  }
})

const courseStore = useCourseStore()
const router = useRouter()
const newPageTitle = ref('')
const newPageType = ref('static')

const currentTopic = computed(() => 
  courseStore.currentCourse?.topics.find(t => t.id === props.topicId)
)

const pages = computed(() => currentTopic.value?.pages || [])

const availablePageTypes = ref(['static', 'menu', 'accordion', 'carousel', 'clickreveal', 'question_multichoice'])

const addPage = () => {
  if (newPageTitle.value.trim()) {
    courseStore.addPageToTopic({
      topicId: props.topicId,
      pageTitle: newPageTitle.value.trim(),
      pageType: newPageType.value
    })
    newPageTitle.value = ''
    newPageType.value = 'static'
  }
}

const deletePage = (pageId, pageTitle) => {
  if (confirm(`Are you sure you want to delete the page "${pageTitle}"?`)) {
    courseStore.removePage({
      topicId: props.topicId,
      pageId
    })
  }
}

const handleEditPage = (pageId) => {
  router.push({
    name: 'PageEditor',
    params: {
      courseId: props.courseId,
      topicId: props.topicId,
      pageId: pageId
    }
  });
}
</script>

<template>
  <div v-if="currentTopic" class="page-manager">
    <h3>Pages for Topic: {{ currentTopic.title }}</h3>

    <div class="add-page-form">
      <div class="form-row">
        <div class="form-group">
          <label for="pageTitle">Page Title</label>
          <input
            id="pageTitle"
            v-model="newPageTitle"
            type="text"
            placeholder="Enter page title"
            @keyup.enter="addPage"
          >
        </div>

        <div class="form-group">
          <label for="pageType">Page Type</label>
          <select
            id="pageType"
            v-model="newPageType"
          >
            <option 
              v-for="type in availablePageTypes" 
              :key="type" 
              :value="type"
            >
              {{ type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ') }}
            </option>
          </select>
        </div>

        <button 
          @click="addPage"
          :disabled="!newPageTitle.trim()"
          class="add-button"
        >
          Add Page
        </button>
      </div>
    </div>

    <div v-if="pages.length === 0" class="no-pages">
      No pages yet. Add your first page above.
    </div>

    <ul v-else class="pages-list">
      <li v-for="page in pages" :key="page.id" class="page-item">
        <div class="page-header">
          <div class="page-info">
            <h4>{{ page.title }}</h4>
            <span class="page-type">{{ page.page_type }}</span>
          </div>
          <div class="page-actions">
            <button 
              @click="handleEditPage(page.id)"
              class="edit-button"
            >
              Edit Page
            </button>
            <button 
              @click="deletePage(page.id, page.title)"
              class="delete-button"
            >
              Delete Page
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
  <div v-else class="no-topic">
    <p>Topic not found or no course selected.</p>
  </div>
</template>

<style scoped>
.page-manager {
  padding: 20px;
}

h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.add-page-form {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 15px;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-size: 14px;
  color: #2c3e50;
}

input, select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.add-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  height: 35px;
}

.add-button:hover:not(:disabled) {
  background-color: #45a049;
}

.add-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.pages-list {
  list-style: none;
  padding: 0;
}

.page-item {
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 15px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-info h4 {
  margin: 0;
  color: #2c3e50;
}

.page-type {
  font-size: 0.9em;
  color: #666;
  background: #e0e0e0;
  padding: 2px 8px;
  border-radius: 4px;
}

.page-actions {
  display: flex;
  gap: 10px;
}

.edit-button,
.delete-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.edit-button {
  background-color: #2196F3;
  color: white;
}

.edit-button:hover {
  background-color: #1e88e5;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.delete-button:hover {
  background-color: #e53935;
}

.no-pages, .no-topic {
  text-align: center;
  color: #757575;
  padding: 20px;
}
</style> 