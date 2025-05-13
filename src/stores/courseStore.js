import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { PAGE_TYPES } from '../types/courseTypes'

export const useCourseStore = defineStore('course', {
  state: () => {
    // Try to load saved course data from localStorage
    const savedCourse = localStorage.getItem('elearnAuthoringCourse')
    return {
      currentCourse: savedCourse ? JSON.parse(savedCourse) : null,
      // Add a new state property to store all courses
      allCourses: JSON.parse(localStorage.getItem('elearnAuthoringCourses') || '[]')
    }
  },

  getters: {
    course: state => state.currentCourse,
    topics: state => state.currentCourse?.topics || [],
    topicById: state => id => state.currentCourse?.topics.find(t => t.id === id),
    pageById: state => id => {
      for (const topic of state.currentCourse?.topics || []) {
        const page = topic.pages.find(p => p.id === id)
        if (page) return page
      }
      return null
    },
    getCourseForExport: state => {
      if (!state.currentCourse) return null
      
      // Create a deep copy of the course
      const courseData = JSON.parse(JSON.stringify(state.currentCourse))
      
      // Update the timestamp
      courseData.last_saved_timestamp = new Date().toISOString()
      
      return courseData
    }
  },

  actions: {
    /**
     * Clear the current course state
     */
    clearCurrentCourse() {
      this.currentCourse = null
    },

    /**
     * Load a course by its ID from allCourses or localStorage
     * @param {string} id - The course ID to load
     * @returns {Promise<boolean>} True if course was found and loaded, false otherwise
     */
    async loadCourseById(id) {
      try {
        if (!id) {
          this.currentCourse = null
          return false
        }

        // First try to find in allCourses
        const foundCourse = this.allCourses.find(course => course.course_id === id)
        if (foundCourse) {
          // Set currentCourse to a deep copy of the found course
          this.currentCourse = JSON.parse(JSON.stringify(foundCourse))
          return true
        }

        // If not found in allCourses but allCourses is empty, try localStorage fallback
        if (this.allCourses.length === 0) {
          const savedCourse = localStorage.getItem('elearnAuthoringCourse')
          if (savedCourse) {
            const parsedCourse = JSON.parse(savedCourse)
            if (parsedCourse && typeof parsedCourse === 'object' && parsedCourse.course_id === id) {
              this.currentCourse = parsedCourse
              // Add to allCourses since it wasn't there
              this.allCourses.push(parsedCourse)
              localStorage.setItem('elearnAuthoringCourses', JSON.stringify(this.allCourses))
              return true
            }
          }
        }

        // If we get here, no matching course was found
        this.currentCourse = null
        return false
      } catch (error) {
        console.error('Error loading course:', error)
        this.currentCourse = null
        return false
      }
    },

    /**
     * Set the current course by selecting it from allCourses
     * @param {string} courseId - The ID of the course to set as current
     * @returns {boolean} True if course was found and set, false otherwise
     */
    setCurrentCourseById(courseId) {
      if (!courseId) {
        this.currentCourse = null
        return false
      }

      const foundCourse = this.allCourses.find(course => course.course_id === courseId)
      if (foundCourse) {
        // Set currentCourse to a deep copy of the found course
        this.currentCourse = JSON.parse(JSON.stringify(foundCourse))
        return true
      }

      // If course not found, don't change currentCourse
      return false
    },

    createNewCourse(title, initialMetadata = {}) {
      const metadata = {
        description: initialMetadata.description || '',
        author: initialMetadata.author || '',
        version: initialMetadata.version || '1.0.0',
        language: initialMetadata.language || 'en',
        ...initialMetadata
      }

      const newCourse = {
        course_id: uuidv4(),
        title,
        metadata,
        topics: []
      }

      this.currentCourse = newCourse
      
      // Add to allCourses if not already present
      if (!this.allCourses.find(c => c.course_id === newCourse.course_id)) {
        this.allCourses.push(newCourse)
        localStorage.setItem('elearnAuthoringCourses', JSON.stringify(this.allCourses))
      }
    },

    loadCourseFromData(courseData) {
      // Basic validation
      if (!courseData || typeof courseData !== 'object') {
        throw new Error('Invalid course data: must be an object')
      }

      if (!courseData.course_id || typeof courseData.course_id !== 'string') {
        throw new Error('Invalid course data: missing or invalid course_id')
      }

      if (!courseData.title || typeof courseData.title !== 'string') {
        throw new Error('Invalid course data: missing or invalid title')
      }

      if (!Array.isArray(courseData.topics)) {
        throw new Error('Invalid course data: topics must be an array')
      }

      // Validate topics and pages structure
      for (const topic of courseData.topics) {
        if (!topic.id || !topic.title || !Array.isArray(topic.pages)) {
          throw new Error('Invalid topic structure in course data')
        }

        for (const page of topic.pages) {
          if (!page.id || !page.title || !page.page_type) {
            throw new Error('Invalid page structure in course data')
          }
        }
      }

      // If validation passes, set the course and update allCourses
      this.currentCourse = courseData

      // Update or add to allCourses
      const existingIndex = this.allCourses.findIndex(c => c.course_id === courseData.course_id)
      if (existingIndex !== -1) {
        this.allCourses[existingIndex] = courseData
      } else {
        this.allCourses.push(courseData)
      }
      localStorage.setItem('elearnAuthoringCourses', JSON.stringify(this.allCourses))
    },

    updateCourseTitle(newTitle) {
      if (!this.currentCourse) return
      this.currentCourse.title = newTitle
      this.updateLastSaved()
    },

    updateCourseMetadata(updatedMetadata) {
      if (!this.currentCourse) return
      this.currentCourse.metadata = {
        ...this.currentCourse.metadata,
        ...updatedMetadata
      }
      this.updateLastSaved()
    },

    addTopic(topicTitle) {
      if (!this.currentCourse) return
      const newTopic = {
        id: uuidv4(),
        title: topicTitle,
        pages: []
      }
      this.currentCourse.topics.push(newTopic)
      this.updateLastSaved()
      return newTopic.id
    },

    addPageToTopic({ topicId, pageTitle, pageType }) {
      const topic = this.topicById(topicId)
      if (!topic) return

      const newPage = {
        id: uuidv4(),
        title: pageTitle,
        page_type: pageType
      }

      // Initialize content structure for menu pages
      if (pageType === 'menu') {
        newPage.content = {
          heading: '',
          initialText: '',
          menuItems: []
        }
      }

      topic.pages.push(newPage)
      this.updateLastSaved()
      return newPage.id
    },

    removeTopic(topicId) {
      if (!this.currentCourse) return
      const topicIndex = this.currentCourse.topics.findIndex(t => t.id === topicId)
      if (topicIndex !== -1) {
        this.currentCourse.topics.splice(topicIndex, 1)
        this.updateLastSaved()
        return true
      }
      return false
    },

    removePage({ topicId, pageId }) {
      const topic = this.topicById(topicId)
      if (!topic) return false

      const pageIndex = topic.pages.findIndex(p => p.id === pageId)
      if (pageIndex !== -1) {
        topic.pages.splice(pageIndex, 1)
        this.updateLastSaved()
        return true
      }
      return false
    },

    updateLastSaved() {
      if (!this.currentCourse) return
      this.currentCourse.last_saved_timestamp = new Date().toISOString()
    },

    /**
     * Update course details
     * @param {{ title: string, metadata: Object }} details - The updated course details
     * @returns {boolean} True if update was successful
     */
    updateCourseDetails(details) {
      if (!this.currentCourse) return false

      this.currentCourse.title = details.title
      this.currentCourse.metadata = {
        ...this.currentCourse.metadata,
        ...details.metadata
      }
      this.updateLastSaved()
      return true
    }
  }
})

// Initialize store subscription for localStorage persistence
const store = useCourseStore()
store.$subscribe((mutation, state) => {
  if (state.currentCourse) {
    localStorage.setItem('elearnAuthoringCourse', JSON.stringify(state.currentCourse))
    
    // Update the course in allCourses
    const courseIndex = state.allCourses.findIndex(c => c.course_id === state.currentCourse.course_id)
    if (courseIndex !== -1) {
      state.allCourses[courseIndex] = state.currentCourse
    } else {
      state.allCourses.push(state.currentCourse)
    }
    localStorage.setItem('elearnAuthoringCourses', JSON.stringify(state.allCourses))
  } else {
    // Clear localStorage when currentCourse is null
    localStorage.removeItem('elearnAuthoringCourse')
  }
}) 