<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '../stores/courseStore'
import PageManager from './PageManager.vue'

const props = defineProps({
  courseId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const courseStore = useCourseStore()
const newTopicTitle = ref('')
const selectedTopicId = ref(null)

// Ensure we have the correct course loaded
const ensureCorrectCourse = async () => {
  if (!courseStore.currentCourse || courseStore.currentCourse.course_id !== props.courseId) {
    const success = await courseStore.loadCourseById(props.courseId)
    if (!success) {
      alert('Course not found')
      router.push({ name: 'Home' })
    }
  }
}

// Watch for courseId changes
watch(() => props.courseId, ensureCorrectCourse, { immediate: true })

// Computed properties
const topics = computed(() => courseStore.currentCourse?.topics || [])
const currentCourse = computed(() => courseStore.currentCourse)

// Topic operations
const addTopic = () => {
  if (newTopicTitle.value.trim()) {
    courseStore.addTopic(newTopicTitle.value.trim())
    newTopicTitle.value = ''
  }
}

const handleManagePages = (topicId) => {
  router.push({
    name: 'PageManager',
    params: {
      courseId: props.courseId,
      topicId: topicId
    }
  })
}

const handleDeleteTopic = (topicId, topicTitle) => {
  if (confirm(`Are you sure you want to delete the topic "${topicTitle}"?`)) {
    courseStore.removeTopic(topicId)
    if (selectedTopicId.value === topicId) {
      selectedTopicId.value = null
    }
  }
}
</script>

<template>
  <div v-if="currentCourse" class="topic-manager">
    <div class="topics-section">
      <h2>Topics for: {{ currentCourse.title }}</h2>

      <div class="add-topic-form">
        <div class="input-group">
          <input
            v-model="newTopicTitle"
            type="text"
            placeholder="Enter topic title"
            @keyup.enter="addTopic"
          >
          <button 
            @click="addTopic"
            :disabled="!newTopicTitle.trim()"
            class="add-button"
          >
            Add Topic
          </button>
        </div>
      </div>

      <div v-if="topics.length === 0" class="no-topics">
        No topics yet. Add your first topic above.
      </div>

      <div v-else class="topics-list">
        <div v-for="topic in topics" :key="topic.id" class="topic-item">
          <div class="topic-header">
            <h3>{{ topic.title }}</h3>
            <div class="topic-actions">
              <button 
                @click="handleManagePages(topic.id)"
                class="manage-pages-button"
              >
                Manage Pages
              </button>
              <button 
                @click="handleDeleteTopic(topic.id, topic.title)"
                class="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div class="topic-stats">
            {{ topic.pages.length }} page{{ topic.pages.length !== 1 ? 's' : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topic-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.topics-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.add-topic-form {
  margin-bottom: 30px;
}

.input-group {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
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
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-button:hover:not(:disabled) {
  background-color: #45a049;
}

.add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-topics {
  text-align: center;
  color: #666;
  padding: 30px;
  background: #f5f5f5;
  border-radius: 4px;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.topic-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.topic-header h3 {
  margin: 0;
  color: #2c3e50;
}

.topic-actions {
  display: flex;
  gap: 10px;
}

.manage-pages-button {
  padding: 6px 12px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.manage-pages-button:hover {
  background-color: #1976D2;
}

.delete-button {
  padding: 6px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: #d32f2f;
}

.topic-stats {
  color: #666;
  font-size: 14px;
}
</style> 