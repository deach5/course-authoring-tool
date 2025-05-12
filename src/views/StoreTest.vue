<script setup>
import { ref, onMounted } from 'vue'
import { useCourseStore } from '../stores/courseStore'

const courseStore = useCourseStore()
const currentTopicId = ref(null)
const currentPageId = ref(null)
const testResults = ref([])

// Helper function to log results
const logResult = (action, result) => {
  testResults.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    action,
    result: JSON.stringify(result, null, 2)
  })
}

// Test functions
const testCreateCourse = () => {
  courseStore.createNewCourse('Test Course', {
    description: 'A test course',
    author: 'Test Author',
    version: '1.0.0'
  })
  logResult('Create Course', courseStore.course)
}

const testUpdateCourseTitle = () => {
  courseStore.updateCourseTitle('Updated Course Title')
  logResult('Update Course Title', courseStore.course.title)
}

const testUpdateMetadata = () => {
  courseStore.updateCourseMetadata({
    description: 'Updated description',
    language: 'en-US'
  })
  logResult('Update Metadata', courseStore.course.metadata)
}

const testAddTopic = () => {
  const topicId = courseStore.addTopic('Test Topic')
  currentTopicId.value = topicId
  logResult('Add Topic', courseStore.topicById(topicId))
}

const testAddPage = () => {
  if (!currentTopicId.value) {
    logResult('Add Page', 'Error: No topic selected')
    return
  }
  const pageId = courseStore.addPageToTopic({
    topicId: currentTopicId.value,
    pageTitle: 'Test Page',
    pageType: 'content'
  })
  currentPageId.value = pageId
  logResult('Add Page', courseStore.pageById(pageId))
}

const testAddMenuPage = () => {
  if (!currentTopicId.value) {
    logResult('Add Menu Page', 'Error: No topic selected')
    return
  }
  const pageId = courseStore.addPageToTopic({
    topicId: currentTopicId.value,
    pageTitle: 'Menu Page',
    pageType: 'menu'
  })
  currentPageId.value = pageId
  logResult('Add Menu Page', courseStore.pageById(pageId))
}

const testSetMenuLinks = () => {
  if (!currentTopicId.value || !currentPageId.value) {
    logResult('Set Menu Links', 'Error: No topic or page selected')
    return
  }
  courseStore.setMenuLinks({
    topicId: currentTopicId.value,
    pageId: currentPageId.value,
    targetTopicIds: [currentTopicId.value] // Link to self for testing
  })
  logResult('Set Menu Links', courseStore.pageById(currentPageId.value))
}

const testRemovePage = () => {
  if (!currentTopicId.value || !currentPageId.value) {
    logResult('Remove Page', 'Error: No topic or page selected')
    return
  }
  const result = courseStore.removePage({
    topicId: currentTopicId.value,
    pageId: currentPageId.value
  })
  currentPageId.value = null
  logResult('Remove Page', result)
}

const testRemoveTopic = () => {
  if (!currentTopicId.value) {
    logResult('Remove Topic', 'Error: No topic selected')
    return
  }
  const result = courseStore.removeTopic(currentTopicId.value)
  currentTopicId.value = null
  currentPageId.value = null
  logResult('Remove Topic', result)
}

const clearResults = () => {
  testResults.value = []
}

// Display current state
const currentState = () => {
  logResult('Current Store State', courseStore.course)
}
</script>

<template>
  <div class="store-test">
    <h2>Course Store Test Panel</h2>
    
    <div class="test-controls">
      <div class="button-group">
        <h3>Course Operations</h3>
        <button @click="testCreateCourse">Create New Course</button>
        <button @click="testUpdateCourseTitle">Update Course Title</button>
        <button @click="testUpdateMetadata">Update Metadata</button>
      </div>

      <div class="button-group">
        <h3>Topic Operations</h3>
        <button @click="testAddTopic">Add Topic</button>
        <button @click="testRemoveTopic" :disabled="!currentTopicId">Remove Current Topic</button>
      </div>

      <div class="button-group">
        <h3>Page Operations</h3>
        <button @click="testAddPage" :disabled="!currentTopicId">Add Content Page</button>
        <button @click="testAddMenuPage" :disabled="!currentTopicId">Add Menu Page</button>
        <button @click="testSetMenuLinks" :disabled="!currentPageId">Set Menu Links</button>
        <button @click="testRemovePage" :disabled="!currentPageId">Remove Current Page</button>
      </div>

      <div class="button-group">
        <h3>Utilities</h3>
        <button @click="currentState">Show Current State</button>
        <button @click="clearResults">Clear Results</button>
      </div>
    </div>

    <div class="results">
      <h3>Test Results</h3>
      <div class="result-list">
        <div v-for="(result, index) in testResults" :key="index" class="result-item">
          <div class="result-time">{{ result.timestamp }}</div>
          <div class="result-action">{{ result.action }}</div>
          <pre class="result-data">{{ result.result }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.store-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.button-group {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
}

.button-group h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
}

button {
  display: block;
  width: 100%;
  margin: 8px 0;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

.results {
  margin-top: 30px;
}

.result-list {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.result-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.result-time {
  font-size: 0.8em;
  color: #666;
}

.result-action {
  font-weight: bold;
  margin: 5px 0;
}

.result-data {
  background: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 5px 0;
}
</style> 