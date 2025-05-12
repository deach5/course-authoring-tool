<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '../stores/courseStore'
import { importFromJson } from '../utils/fileUtils'
import CourseImportExport from '../components/CourseImportExport.vue'

const router = useRouter()
const courseStore = useCourseStore()
const importError = ref('')

// Computed properties
const currentEditingCourse = computed(() => courseStore.currentCourse)
const allCourses = computed(() => courseStore.allCourses)

// Navigation methods
const navigateToNewCourseSetup = () => {
  courseStore.clearCurrentCourse()
  router.push({ name: 'CourseSetup' })
}

const continueEditing = () => {
  if (currentEditingCourse.value) {
    router.push({ 
      name: 'TopicManager', 
      params: { courseId: currentEditingCourse.value.course_id }
    })
  }
}

const editCourse = async (courseId) => {
  try {
    const success = await courseStore.setCurrentCourseById(courseId)
    if (success) {
      router.push({ 
        name: 'TopicManager', 
        params: { courseId }
      })
    } else {
      alert('Course not found')
    }
  } catch (error) {
    console.error('Error loading course:', error)
    alert('Error loading course')
  }
}

const importCourse = async () => {
  try {
    importError.value = ''
    const courseData = await importFromJson()
    courseStore.loadCourseFromData(courseData)
    router.push({ 
      name: 'TopicManager', 
      params: { courseId: courseStore.currentCourse.course_id }
    })
  } catch (error) {
    importError.value = error.message
  }
}
</script>

<template>
  <div class="home">
    <h1>Course Authoring Dashboard</h1>
    
    <!-- Section 1: Current Course -->
    <section v-if="currentEditingCourse" class="current-course">
      
      <p class="current-course-text">
        You are currently working on: <strong>{{ currentEditingCourse.title }}</strong>
      </p>
      <div class="button-group">
        <button @click="continueEditing" class="primary-button">
          Continue Editing
        </button>
      </div>
    </section>

    <!-- Section 2: Main Actions -->
    <section class="main-actions">
      <h2>Available Actions</h2>
      <div class="action-buttons">
        <button 
          v-if="!currentEditingCourse"
          @click="navigateToNewCourseSetup" 
          class="primary-button"
        >
          Create New Course
        </button>
        <button 
          v-else
          @click="navigateToNewCourseSetup" 
          class="secondary-button"
        >
          Create New Course
        </button>
        <CourseImportExport />
      </div>
    </section>

    <!-- Section 3: Available Courses -->
    <section class="available-courses">
      <h2>Available Courses</h2>
      <div v-if="allCourses.length > 0" class="courses-list">
        <div v-for="course in allCourses" :key="course.course_id" class="course-item">
          <div class="course-info">
            <h3>{{ course.title }}</h3>
            <div class="course-metadata">
              <span v-if="course.metadata?.author">
                Author: {{ course.metadata.author }}
              </span>
              <span v-if="course.last_saved_timestamp">
                Last edited: {{ new Date(course.last_saved_timestamp).toLocaleDateString() }}
              </span>
            </div>
          </div>
          <button 
            @click="editCourse(course.course_id)" 
            class="edit-button"
          >
            Edit Course
          </button>
        </div>
      </div>
      <p v-else class="no-courses">
        No courses created yet. Start by creating a new course or importing an existing one.
      </p>
    </section>

    <!-- Error Messages -->
    <div v-if="importError" class="error-message">
      {{ importError }}
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 40px;
  font-size: 2em;
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5em;
}

section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.current-course-text {
  font-size: 1.1em;
  color: #34495e;
  margin-bottom: 20px;
}

.current-course-text strong {
  color: #2c3e50;
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.primary-button {
  padding: 10px 20px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.primary-button:hover {
  background-color: #1976D2;
}

.secondary-button {
  padding: 10px 20px;
  background-color: #78909C;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.secondary-button:hover {
  background-color: #607D8B;
}

.error-message {
  color: #d32f2f;
  text-align: center;
  padding: 10px;
  margin-top: 20px;
  background: #ffebee;
  border-radius: 4px;
}

/* New styles for courses list */
.courses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.course-item:hover {
  background: #e9ecef;
}

.course-info {
  flex: 1;
}

.course-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1em;
}

.course-metadata {
  margin-top: 4px;
  font-size: 0.9em;
  color: #6c757d;
  display: flex;
  gap: 16px;
}

.edit-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: #45a049;
}

.no-courses {
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

@media (max-width: 600px) {
  .button-group {
    flex-direction: column;
  }

  .action-buttons {
    align-items: stretch;
  }

  .primary-button,
  .secondary-button,
  .edit-button {
    width: 100%;
  }

  .course-item {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .course-metadata {
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }
}
</style> 