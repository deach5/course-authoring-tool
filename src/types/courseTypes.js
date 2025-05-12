/**
 * @typedef {Object} Page
 * @property {string} id - Unique identifier for the page
 * @property {string} title - Title of the page
 * @property {string} page_type - Type of the page
 * @property {string[]} [menu_links_to_topic_ids] - Optional array of topic IDs that this page links to
 */

/**
 * @typedef {Object} Topic
 * @property {string} id - Unique identifier for the topic
 * @property {string} title - Title of the topic
 * @property {Page[]} pages - Array of pages within this topic
 */

/**
 * @typedef {Object} CourseMetadata
 * @property {string} [description] - Optional course description
 * @property {string} [author] - Optional author name
 * @property {string} [version] - Optional version number
 * @property {string} [language] - Optional language code
 */

/**
 * @typedef {Object} Course
 * @property {string} course_id - Unique identifier for the course
 * @property {string} title - Title of the course
 * @property {CourseMetadata} metadata - Course metadata
 * @property {Topic[]} topics - Array of topics within the course
 * @property {string} [last_saved_timestamp] - Optional timestamp of last save
 */

export const PAGE_TYPES = {
  CONTENT: 'content',
  QUIZ: 'quiz',
  ASSESSMENT: 'assessment',
  INTERACTIVE: 'interactive'
}; 