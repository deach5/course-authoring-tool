<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '../stores/courseStore'
import { exportToJson, importFromJson } from '../utils/fileUtils'

const router = useRouter()
const courseStore = useCourseStore()
const importError = ref('')
const importSuccess = ref(false)

const exportCourse = () => {
  const courseData = courseStore.getCourseForExport
  if (!courseData) {
    alert('No course data available to export')
    return
  }

  const filename = `${courseData.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
  exportToJson(courseData, filename)
}

const importCourse = async () => {
  try {
    importError.value = ''
    importSuccess.value = false
    
    const courseData = await importFromJson()
    courseStore.loadCourseFromData(courseData)
    importSuccess.value = true
    
    // Navigate to TopicManager for the imported course
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
  <div class="course-import-export">
    <div class="actions">
      <button 
        @click="exportCourse" 
        :disabled="!courseStore.currentCourse"
        class="action-button export-button"
      >
        Export Course
      </button>
      
      <button 
        @click="importCourse"
        class="action-button import-button"
      >
        Import Course
      </button>
    </div>

    <div v-if="importError" class="error-message">
      {{ importError }}
    </div>
    
    <div v-if="importSuccess" class="success-message">
      Course imported successfully!
    </div>
  </div>
</template>

<style scoped>
.course-import-export {
  margin: 20px 0;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  color: white;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-button {
  background-color: #4CAF50;
}

.export-button:hover:not(:disabled) {
  background-color: #45a049;
}

.import-button {
  background-color: #2196F3;
}

.import-button:hover:not(:disabled) {
  background-color: #1976D2;
}

.error-message {
  color: #d32f2f;
  margin-top: 16px;
  text-align: center;
}

.success-message {
  color: #4CAF50;
  margin-top: 16px;
  text-align: center;
}
</style> 