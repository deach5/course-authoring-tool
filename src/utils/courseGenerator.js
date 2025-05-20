import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/--+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

const getShortIdFromUuid = (uuid) => {
    if (!uuid) return '';
    // Simple approach: use first 8 characters
    return uuid.substring(0, 8);
};

/**
 * Generates the playable course files from the course data.
 * @param {object} courseData - The complete course data object.
 */
export const generateCourse = async (courseData) => {
  console.log('Generator received course data:', courseData);

  if (!courseData) {
    console.error('No course data provided for generation.');
    return;
  }

  const MAX_FOLDER_NAME_LENGTH = 16;
  const MAX_FILE_NAME_LENGTH = 16;
  const HTML_EXTENSION_LENGTH = '.html'.length;

  let templateContent;
  try {
    const response = await fetch('/player-template.html');
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }
    templateContent = await response.text();
    console.log('Player template fetched successfully.');
  } catch (error) {
    console.error('Error fetching player template:', error);
    alert('Failed to load player template. Course generation aborted.');
    return;
  }

  const zip = new JSZip();
  const courseFolderName = slugify(courseData.title) || 'untitled-course'; // Use slugify for course folder too
  const rootFolder = zip.folder(courseFolderName);
  const pageUuidToFilepathMap = {};

  // --- Create pages directory ---
  const pagesFolder = rootFolder.folder('pages');

  // --- Generate actual page files ---
  if (courseData.topics && courseData.topics.length > 0) {
    for (let topicIndex = 0; topicIndex < courseData.topics.length; topicIndex++) {
      const topicData = courseData.topics[topicIndex];
      
      const topicSlugRaw = slugify(topicData.title || 'untitled-topic');
      const topicPrefix = `t${topicIndex}_`;
      const maxTopicSlugLength = MAX_FOLDER_NAME_LENGTH - topicPrefix.length;
      const topicSlugTruncated = topicSlugRaw.substring(0, Math.max(0, maxTopicSlugLength));
      const topicFolderName = `${topicPrefix}${topicSlugTruncated}`;
      
      // Potential improvement: Add suffix for duplicate topic slugs if titles are identical.
      const currentTopicFolder = pagesFolder.folder(topicFolderName);

      if (topicData.pages && topicData.pages.length > 0) {
        for (let pageIndex = 0; pageIndex < topicData.pages.length; pageIndex++) {
          const pageData = topicData.pages[pageIndex];
          const pageSpecificContentHtml = generatePageHtml(pageData, courseData, topicData);
          
          const pageSlugRaw = slugify(pageData.title || 'untitled-page');
          const pagePrefix = `p${pageIndex}_`;
          const maxPageSlugLength = MAX_FILE_NAME_LENGTH - HTML_EXTENSION_LENGTH - pagePrefix.length;
          const pageSlugTruncated = pageSlugRaw.substring(0, Math.max(0, maxPageSlugLength));
          const pageFileName = `${pagePrefix}${pageSlugTruncated}.html`;
          
          const pageFilePath = `${topicFolderName}/${pageFileName}`;

          pageUuidToFilepathMap[pageData.id] = pageFilePath;          

          let populatedTemplate = templateContent;
          populatedTemplate = populatedTemplate.replace(/\{\{\s*courseTitle\s*\}\}/g, courseData.title || '');
          populatedTemplate = populatedTemplate.replace(/\{\{\s*topicTitle\s*\}\}/g, topicData.title || '');
          populatedTemplate = populatedTemplate.replace(/\{\{\s*pageTitle\s*\}\}/g, pageData.title || '');
          populatedTemplate = populatedTemplate.replace(/\{\{\s*lang\s*\}\}/g, courseData.metadata?.language || 'en');
          
          
          const placeholderRegex = /<div\s+id="page-specific-content-placeholder"\s*><\/div>/i;



          if (placeholderRegex.test(populatedTemplate)) {
            
            populatedTemplate = populatedTemplate.replace(placeholderRegex, pageSpecificContentHtml);
          } else {
            
            console.warn(`Placeholder <div id="page-specific-content-placeholder"></div> not found in template for page: ${pageData.title}.`);
          }

        

          currentTopicFolder.file(pageFileName, populatedTemplate);
        }
      }
    }
  }
  
  // --- Determine redirect for index.html (AFTER pageUuidToFilepathMap is populated) ---
  let indexHtmlContent;
  const firstTopic = courseData.topics?.[0];
  const firstPage = firstTopic?.pages?.[0];
  const firstPagePath = firstPage ? pageUuidToFilepathMap[firstPage.id] : null;

  if (firstPagePath) {
    indexHtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${courseData.title}</title>
        <meta http-equiv="refresh" content="0;url=pages/${firstPagePath}">
    </head>
    <body>
        <p>Redirecting to the course content...</p>
    </body>
    </html>
  `;
  } else {
    indexHtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${courseData.title || 'Course'}</title>
    </head>
    <body>
        <h1>Course is Empty</h1>
        <p>This course does not have any topics or pages yet.</p>
    </body>
    </html>
  `;
  }
  rootFolder.file('index.html', indexHtmlContent);

  // --- Add CSS and JS files ---
  rootFolder.folder('css').file('style.css', generateGlobalCss(courseData));
  rootFolder.folder('js').file('script.js', generatePlayerScript(courseData, pageUuidToFilepathMap)); // Pass map

  console.log('Course files generated and added to zip structure.');

  // --- Final step: Generate and save the zip file ---
  try {
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${courseFolderName}.zip`);
    console.log('Course generation complete. Zip file saved.');
  } catch (error) {
    console.error('Error generating zip file:', error);
    alert('Failed to generate course files.');
  }
};

// Helper function placeholders (will be implemented later)
const generatePageHtml = (pageData, courseData, topicData) => {
    let pageHtml = '';

    // Add the Page Heading
    if (pageData.content?.heading) {
        pageHtml += `<h1 class="page-heading">${pageData.content.heading}</h1>`;
    }

    // Add the Initial Text (raw HTML from WYSIWYG)
    if (pageData.content?.initialText) {
        pageHtml += `<div class="initial-text">${pageData.content.initialText}</div>`;
    }
    

    let typeSpecificContentHtml = '';
    switch (pageData.page_type) {
        case 'static':
            typeSpecificContentHtml = '<div class="static-content"></div>'; // Marker for static content area
            break;
        case 'menu':
            typeSpecificContentHtml = '<div class="menu-container">';
            if (pageData.content?.menuItems && Array.isArray(pageData.content.menuItems)) {
                pageData.content.menuItems.forEach(menuItem => {
                    typeSpecificContentHtml += `
                        <button class="menu-button" data-target-page-id="${menuItem.targetPageId}">
                            ${menuItem.label || 'Untitled Menu Item'}
                        </button>
                    `;
                });
            }
            typeSpecificContentHtml += '</div>';
            break;
        case 'accordion':
            typeSpecificContentHtml = '<div class="accordion-container">';
            if (pageData.content?.items && Array.isArray(pageData.content.items)) {
                pageData.content.items.forEach(item => {
                    typeSpecificContentHtml += `
                        <div class="accordion-item">
                            <button class="accordion-header">${item.header || 'Untitled Item'}</button>
                            <div class="accordion-body" style="display: none;">
                                ${item.body || ''}
                            </div>
                        </div>
                    `;
                });
            }
            typeSpecificContentHtml += '</div>';
            break;
        case 'carousel':
            typeSpecificContentHtml = '<div class="carousel-container">';
            
            // Add panels container
            typeSpecificContentHtml += '<div class="carousel-panels">';
            
            if (pageData.content?.panels && Array.isArray(pageData.content.panels)) {
                pageData.content.panels.forEach((panel, panelIndex) => {
                    typeSpecificContentHtml += `
                        <div class="carousel-panel" 
                             data-panel-id="${getShortIdFromUuid(panel.id)}"
                             ${panelIndex === 0 ? '' : 'style="display: none;"'}>
                            ${panel.body || ''}
                        </div>
                    `;
                });
            }
            
            typeSpecificContentHtml += '</div>'; // Close carousel-panels
            
            // Add navigation controls
            typeSpecificContentHtml += `
                <div class="carousel-controls">
                    <button class="carousel-prev" disabled>Previous</button>
                    <div class="carousel-progress">1 / ${pageData.content?.panels?.length || 0}</div>
                    <button class="carousel-next" ${pageData.content?.panels?.length <= 1 ? 'disabled' : ''}>Next</button>
                </div>
            `;
            
            typeSpecificContentHtml += '</div>'; // Close carousel-container
            break;
        case 'clickreveal':
            typeSpecificContentHtml = '<div class="clickreveal-container">';
            
            if (pageData.content?.items && Array.isArray(pageData.content.items)) {
                pageData.content.items.forEach(item => {
                    typeSpecificContentHtml += `
                        <div class="clickreveal-item">
                            <button class="clickreveal-button" data-target-id="${getShortIdFromUuid(item.id)}">
                                ${item.buttonLabel || 'Click Here'}
                            </button>
                            <div class="clickreveal-content" id="${getShortIdFromUuid(item.id)}" style="display: none;">
                                ${item.revealedContent || ''}
                            </div>
                        </div>
                    `;
                });
            }
            
            typeSpecificContentHtml += '</div>';
            break;
        case 'question_multichoice':
            typeSpecificContentHtml = `<div class="question-container" data-enable-try-again="${pageData.content?.enableTryAgain || false}" data-try-again-attempts="${pageData.content?.tryAgainAttempts || 0}">`;
            
            // Add question text
            if (pageData.content?.questionText) {
                typeSpecificContentHtml += `<div class="question-text">${pageData.content.questionText}</div>`;
            }
            
            // Add options container
            typeSpecificContentHtml += '<div class="question-options">';
            
            // Add options if they exist
            if (pageData.content?.options && Array.isArray(pageData.content.options)) {
                pageData.content.options.forEach(option => {
                    typeSpecificContentHtml += `
                        <div class="option-item" data-option-id="${getShortIdFromUuid(option.id)}" data-is-correct="${option.isCorrect || false}">
                            <input type="radio" name="${getShortIdFromUuid(pageData.id)}-option" value="${getShortIdFromUuid(option.id)}" id="${getShortIdFromUuid(pageData.id)}-${getShortIdFromUuid(option.id)}">
                            <label for="${getShortIdFromUuid(pageData.id)}-${getShortIdFromUuid(option.id)}">${option.text || ''}</label>
                        </div>
                    `;
                });
            }
            
            // Close options container
            typeSpecificContentHtml += '</div>';
            
            // Add feedback containers
            typeSpecificContentHtml += `
                <div class="feedback feedback-correct" style="display: none;">${pageData.content?.correctFeedback || ''}</div>
                <div class="feedback feedback-incorrect" style="display: none;">${pageData.content?.incorrectFeedback || ''}</div>
            `;
            
            // Close question container
            typeSpecificContentHtml += '</div>';
            break;
        default:
            typeSpecificContentHtml = `<div class="unknown-content"><p>Unsupported page type: ${pageData.page_type}</p></div>`;
            break;
    }
    

    
    pageHtml += typeSpecificContentHtml;
    
    
    
    return pageHtml;
};

const generateGlobalCss = (courseData) => {
    return `
/* CSS Variables */
:root {
  /* Colors */
  --clr-primary: #007bff;
  --clr-secondary: #28a745;
  --clr-danger: #dc3545;
  --clr-neutral: #6c757d;
  --clr-background-page: #f8f8f8;
  --clr-background-content: #fff;
  --clr-background-section-alt-1: #f7f7f7;
  --clr-background-section-alt-2: #e9f5ff;
  --clr-background-section-alt-3: #d4edda;

  --clr-text-base: #333;
  --clr-text-heading: #333;
  --clr-text-alt-1: #444;
  --clr-text-alt-2: #555;
  --clr-text-correct: #155724;
  --clr-text-incorrect: #721c24;

  --clr-border-base: #eee;
  --clr-border-alt-1: #ddd;
  --clr-border-correct: #c3e6cb;
  --clr-border-incorrect: #f5c6cb;

  /* Typography */
  --ff-base: sans-serif;
  --fs-base: 1rem;
  --lh-base: 1.6;

  /* Spacing */
  --space-sm: 10px;
  --space-md: 15px;
  --space-lg: 20px;

  /* Borders/Shadows */
  --border-radius-base: 4px;
  --box-shadow-base: 0 2px 5px rgba(0,0,0,0.1);
}

/* Base Styles */
body { 
  font-family: var(--ff-base);
  line-height: var(--lh-base);
  background-color: var(--clr-background-page);
  color: var(--clr-text-base);
}

#course-player {
  background-color: var(--clr-background-content);
  box-shadow: var(--box-shadow-base);
  padding: var(--space-lg);
  border-radius: var(--border-radius-base);
}

/* Page Elements */
.page-heading { 
  color: var(--clr-text-heading);
  border-bottom: 1px solid var(--clr-border-base);
  padding-bottom: var(--space-sm);
  margin-bottom: var(--space-md);
}

.initial-text { 
  margin-bottom: var(--space-lg);
}

/* Menu Styles */
.menu-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.menu-button {
  background-color: var(--clr-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-base);
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  text-align: left;
}

.menu-button:hover {
  background-color: var(--clr-secondary);
}

/* Accordion Styles */
.accordion-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.accordion-item {
  border: 1px solid var(--clr-border-alt-1);
  border-radius: var(--border-radius-base);
}

.accordion-header {
  background-color: var(--clr-background-section-alt-1);
  color: var(--clr-text-alt-1);
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--border-radius-base) var(--border-radius-base) 0 0;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.accordion-body {
  padding: var(--space-md);
  background-color: var(--clr-background-content);
  border-top: 1px solid var(--clr-border-alt-1);
}

/* Carousel Styles */
.carousel-container {
  position: relative;
  margin: var(--space-lg) 0;
}

.carousel-panels {
  position: relative;
  min-height: 200px;
}

.carousel-panel {
  padding: var(--space-md);
  background-color: var(--clr-background-content);
  border: 1px solid var(--clr-border-alt-1);
  border-radius: var(--border-radius-base);
}

.carousel-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-md);
}

.carousel-prev,
.carousel-next {
  background-color: var(--clr-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-base);
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
}

.carousel-prev:disabled,
.carousel-next:disabled {
  background-color: var(--clr-neutral);
  cursor: not-allowed;
}

.carousel-progress {
  color: var(--clr-text-alt-2);
}

/* Clickreveal Styles */
.clickreveal-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.clickreveal-item {
  border: 1px solid var(--clr-border-alt-1);
  border-radius: var(--border-radius-base);
}

.clickreveal-button {
  background-color: var(--clr-background-section-alt-2);
  color: var(--clr-text-base);
  border: none;
  border-radius: var(--border-radius-base) var(--border-radius-base) 0 0;
  padding: var(--space-sm) var(--space-md);
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.clickreveal-content {
  padding: var(--space-md);
  background-color: var(--clr-background-content);
  border-top: 1px solid var(--clr-border-alt-1);
}

/* Question Styles */
.question-container {
  margin: var(--space-lg) 0;
}

.question-text {
  margin-bottom: var(--space-md);
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border: 1px solid var(--clr-border-alt-1);
  border-radius: var(--border-radius-base);
}

.option-item input[type="radio"] {
  margin-top: 4px;
}

.option-item label {
  flex: 1;
}

.feedback {
  margin-top: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--border-radius-base);
}

.feedback-correct {
  background-color: var(--clr-background-section-alt-3);
  border: 1px solid var(--clr-border-correct);
  color: var(--clr-text-correct);
}

.feedback-incorrect {
  background-color: var(--clr-background-section-alt-2);
  border: 1px solid var(--clr-border-incorrect);
  color: var(--clr-text-incorrect);
}
`;
};

 const generatePlayerScript = (courseData, pageUuidToFilepathMap) => {
     return `
// Helper function for consistent short ID generation
const getShortIdFromUuid = (uuid) => {
    if (!uuid) return '';
    return uuid.substring(0, 8);
};

// Basic Player Script
console.log("Player script loaded for course: ${courseData.title}");

const pagePaths = ${JSON.stringify(pageUuidToFilepathMap, null, 2)};
console.log('Page ID to Filepath Map:', pagePaths);

// Navigation logic (Placeholder)
// ... code to handle Next/Back buttons, menu links using pagePaths ...

// Interactivity logic (Placeholders)
// ... code for accordion toggle, carousel slides, quiz handling ...
`;
 }; 