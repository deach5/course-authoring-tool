# Course Authoring Tool

A modern, Vue 3-based eLearning course authoring tool that allows educators and content creators to create, manage, and organize educational content with a user-friendly interface.

## Features

### Course Management
- Create new courses with metadata (title, author, version, language)
- Import/export courses in JSON format
- View and edit multiple courses
- Track last edited timestamps
- Persistent storage using localStorage

### Course Structure
- Organize content into topics and pages
- Support for different page types including menu pages
- Flexible navigation between topics
- Nested routing for intuitive content organization

### User Interface
- Clean, modern dashboard design
- Responsive layout for all devices
- Intuitive navigation between courses and content
- Real-time feedback and error handling
- Progress tracking and course status indicators

## Technical Stack

- **Framework**: Vue 3
- **State Management**: Pinia
- **Routing**: Vue Router
- **Storage**: localStorage
- **Build Tool**: Vite
- **Language**: JavaScript/TypeScript

## Project Structure

```
src/
├── components/           # Reusable Vue components
│   ├── CourseImportExport.vue
│   └── ...
├── stores/              # Pinia stores
│   ├── courseStore.js   # Main course state management
│   └── ...
├── views/               # Page components
│   ├── Home.vue        # Dashboard view
│   ├── CourseView.vue  # Course editing view
│   └── ...
├── router/             # Vue Router configuration
├── types/              # TypeScript types/interfaces
└── utils/              # Utility functions
```

## Core Components

### Home Dashboard (Home.vue)
- Displays list of all available courses
- Shows currently active course
- Provides course creation and import options
- Quick access to course editing

### Course View (CourseView.vue)
- Main course editing interface
- Topic and page management
- Course metadata editing
- Navigation between course sections

### Course Store (courseStore.js)
- Centralized state management
- Course data persistence
- Import/export functionality
- Course validation and error handling

## Key Features Implementation

### URL-Centric Navigation
- Each course has a unique URL with courseId
- Nested routing for topics and pages
- Bookmarkable course states
- Clean navigation history

### State Management
- Pinia store for centralized state
- Persistent storage with localStorage
- Real-time state updates
- Error handling and validation

### Multi-Course Support
- Management of multiple courses
- Course switching without data loss
- Individual course history tracking
- Course metadata preservation

## Usage

### Creating a New Course
1. Click "Create New Course" on the dashboard
2. Enter course details (title, author, version, etc.)
3. Save to begin adding content
4. Add topics and pages as needed

### Importing/Exporting Courses
1. Use the Import/Export buttons on the dashboard
2. Courses are saved in JSON format
3. Import validates course structure
4. Export includes all course data and metadata

### Editing Courses
1. Select a course from the dashboard
2. Navigate through topics and pages
3. Edit content using the built-in editors
4. Changes are automatically saved

### Managing Multiple Courses
1. Switch between courses from the dashboard
2. Each course maintains its own state
3. Last edited course is highlighted
4. Quick access to recently edited courses

## Development

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Key Files
- `src/stores/courseStore.js`: Main state management
- `src/views/Home.vue`: Dashboard implementation
- `src/views/CourseView.vue`: Course editing interface
- `src/components/CourseImportExport.vue`: Import/export functionality

## Future Enhancements

- Cloud storage integration
- Collaborative editing
- Rich text editor integration
- Media asset management
- Course templates
- Export to various formats (SCORM, xAPI)
- User roles and permissions
- Course analytics and tracking

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any enhancements.

## License

[MIT License](LICENSE)
