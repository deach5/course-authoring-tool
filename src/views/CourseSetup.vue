<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCourseStore } from '../stores/courseStore'

const props = defineProps({
  courseId: {
    type: String,
    required: false
  }
})

const router = useRouter()
const route = useRoute()
const courseStore = useCourseStore()

// Reactive variables for course data
const courseTitle = ref('')
const description = ref('')
const author = ref('')
const version = ref('')
const language = ref('')

// Computed property to determine if we're in edit mode
const isEditMode = computed(() => Boolean(props.courseId))

// Function to load course data into form
const loadCourseData = async () => {
  if (!props.courseId) {
    // Clear form for new course
    clearForm()
    return
  }

  // If current course doesn't match the ID, try to load it
  if (!courseStore.currentCourse || courseStore.currentCourse.course_id !== props.courseId) {
    const success = await courseStore.loadCourseById(props.courseId)
    if (!success) {
      alert('Course not found')
      router.push({ name: 'Home' })
      return
    }
  }

  // Pre-fill form with course data
  courseTitle.value = courseStore.currentCourse.title
  description.value = courseStore.currentCourse.metadata.description || ''
  author.value = courseStore.currentCourse.metadata.author || ''
  version.value = courseStore.currentCourse.metadata.version || ''
  language.value = courseStore.currentCourse.metadata.language || ''
}

// Function to clear form fields
const clearForm = () => {
  courseTitle.value = ''
  description.value = ''
  author.value = ''
  version.value = ''
  language.value = ''
}

// Function to save course (create or update)
const saveCourse = () => {
  const courseData = {
    title: courseTitle.value,
    metadata: {
      description: description.value,
      author: author.value,
      version: version.value,
      language: language.value
    }
  }

  if (isEditMode.value) {
    // Update existing course
    courseStore.updateCourseDetails(courseData)
    router.push({ 
      name: 'TopicManager', 
      params: { courseId: props.courseId }
    })
  } else {
    // Create new course
    courseStore.createNewCourse(courseTitle.value, courseData.metadata)
    router.push({ 
      name: 'TopicManager', 
      params: { courseId: courseStore.currentCourse.course_id }
    })
  }
}

// Watch for courseId changes
watch(() => props.courseId, loadCourseData)

// Load course data on mount
onMounted(loadCourseData)
</script>

<template>
  <div class="course-setup">
    <h2>{{ isEditMode ? 'Edit Course' : 'Create New Course' }}</h2>
    
    <form @submit.prevent="saveCourse" class="course-form">
      <div class="form-group">
        <label for="courseTitle">Course Title</label>
        <input
          id="courseTitle"
          v-model="courseTitle"
          type="text"
          required
          placeholder="Enter course title"
        >
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="description"
          placeholder="Enter course description"
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="author">Author</label>
        <input
          id="author"
          v-model="author"
          type="text"
          placeholder="Enter author name"
        >
      </div>

      <div class="form-group">
        <label for="version">Version</label>
        <input
          id="version"
          v-model="version"
          type="text"
          placeholder="Enter version (e.g., 1.0.0)"
        >
      </div>

      <div class="form-group">
        <label for="language">Language</label>
        <input
          id="language"
          v-model="language"
          type="text"
          placeholder="Enter language code (e.g., en)"
        >
      </div>

      <div class="form-actions">
        <button 
          type="submit" 
          class="save-button"
          :disabled="!courseTitle.trim()"
        >
          {{ isEditMode ? 'Save Changes' : 'Create Course' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.course-setup {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.course-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: bold;
  color: #34495e;
}

input, textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.save-button {
  padding: 10px 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: #45a049;
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 