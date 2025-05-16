<script setup>
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCourseStore } from '../stores/courseStore'
import CourseImportExport from '../components/CourseImportExport.vue'

const props = defineProps({
  courseId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const route = useRoute()
const courseStore = useCourseStore()

const hasCourse = computed(() => courseStore.currentCourse !== null)

// Load course when component mounts or courseId changes
const loadCourse = async () => {
  try {
    // Check if we need to load/switch course
    if (!courseStore.currentCourse || courseStore.currentCourse.course_id !== props.courseId) {
      const success = await courseStore.loadCourseById(props.courseId)
      if (!success) {
        alert('Course not found')
        router.push({ name: 'Home' })
      }
    }
  } catch (error) {
    console.error('Error loading course:', error)
    alert('Error loading course')
    router.push({ name: 'Home' })
  }
}

// Watch for courseId changes
watch(() => props.courseId, loadCourse, { immediate: true })

const generateCourse = async () => {
  console.log('Generating course...');
};
</script>

<template>
  <div v-if="hasCourse" class="course-view">
    <header class="course-header">
      <h1>{{ courseStore.currentCourse.title }}</h1>
      <div class="course-meta">
        <span v-if="courseStore.currentCourse.metadata.author">
          Author: {{ courseStore.currentCourse.metadata.author }}
        </span>
        <span v-if="courseStore.currentCourse.metadata.version">
          Version: {{ courseStore.currentCourse.metadata.version }}
        </span>
      </div>
      <CourseImportExport class="import-export" />
      <button class="generate-button" @click="generateCourse">Generate Course</button>
    </header>

    <nav class="course-nav">
      <router-link :to="{ name: 'Home' }" class="nav-link home-link">
        <span class="nav-icon">←</span>
        Back to Dashboard
      </router-link>
      <div class="nav-divider"></div>
      <router-link 
        :to="{ name: 'TopicManager', params: { courseId: props.courseId }}" 
        class="nav-link"
      >
        Topics
      </router-link>
      <router-link 
        :to="{ name: 'CourseSettings', params: { courseId: props.courseId }}" 
        class="nav-link"
      >
        Course Settings
      </router-link>
    </nav>

    <main class="course-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.course-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.course-header {
  background: #2c3e50;
  color: white;
  padding: 20px;
  text-align: center;
}

.course-header h1 {
  margin: 0;
  font-size: 24px;
}

.course-meta {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.8;
}

.course-meta span {
  margin: 0 10px;
}

.import-export {
  margin-top: 16px;
}

.course-nav {
  background: #34495e;
  padding: 10px 20px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.home-link {
  color: #81D4FA;
  font-weight: 500;
}

.nav-icon {
  font-size: 18px;
  line-height: 1;
}

.nav-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
}

.course-content {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
}

.generate-button {
  background-color: #673ab7; /* Purple */
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
  transition: background-color 0.2s;
}

.generate-button:hover {
  background-color: #5e35b1;
}

@media (max-width: 600px) {
  .course-nav {
    flex-wrap: wrap;
  }

  .nav-divider {
    display: none;
  }

  .home-link {
    width: 100%;
    justify-content: center;
  }
}
</style> 