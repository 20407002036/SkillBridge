# SkillBridge Frontend (React CRA)

This is the **Create React App** based frontend for SkillBridge - an AI-powered career development platform that analyzes resumes, identifies skill gaps, and generates personalized learning roadmaps.

## 🚀 Features

- **Modern React UI**: Built with React 19 and modern hooks
- **Responsive Design**: TailwindCSS for mobile-first responsive design  
- **Interactive Components**: Landing page, resume upload, skill recommendations, roadmaps
- **Real-time Updates**: Polling-based status updates for async operations
- **Professional Dashboard**: Visualize skills, progress, and learning paths
- **PDF Downloads**: Download generated roadmaps as professional PDFs

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
│   ├── LandingPage.jsx    # Home page with features overview
│   ├── UploadResume.jsx   # Resume upload interface
│   ├── RecommendedSkills.jsx # AI skill recommendations
│   ├── Roadmap.jsx        # Learning roadmap display
│   ├── Dashboard.jsx      # User progress dashboard
│   └── Profile.jsx        # User profile management
├── hooks/              # Custom React hooks
├── styles/             # CSS and styling files
├── axiosConfig.js      # API configuration
└── App.js             # Main application component
```

## 🛠️ Tech Stack

- **React**: 19.2.0 with modern hooks and functional components
- **React Router**: 6.30.1 for client-side routing
- **Axios**: 1.4.0 for API communication
- **Lucide React**: 0.545.0 for modern icons
- **TailwindCSS**: For utility-first styling
- **React Testing Library**: For component testing

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Running SkillBridge backend (see main README)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/20407002036/SkillBridge.git
   cd SkillBridge/superfrontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env file
   echo "REACT_APP_API_URL=http://localhost:5000/api/v1" > .env
   ```

4. **Start development server**
   ```bash
   npm start
   ```

   Opens [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run lint`

Runs ESLint to check for code quality and style issues.\
Automatically fixes many issues with the `--fix` flag.

## 🔗 API Integration

This frontend communicates with the SkillBridge Flask backend through RESTful API calls:

- **Base URL**: `http://localhost:5000/api/v1` (development)
- **Authentication**: JWT Bearer tokens (planned)
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Real-time status updates for async operations

## 🎨 UI Components

### Key Pages
- **LandingPage**: Hero section, features overview, call-to-action
- **UploadResume**: Drag-drop file upload with progress indicators  
- **RecommendedSkills**: AI-generated skill recommendations with selection
- **Roadmap**: Interactive learning roadmap with phases and milestones
- **Dashboard**: Progress tracking and analytics visualization

### Design System
- **Colors**: Professional blue/gray palette
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable buttons, cards, forms, and modals

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Coverage report:
```bash
npm test -- --coverage
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: `vercel deploy`
- **Netlify**: Connect Git repository
- **AWS S3**: Upload `build/` folder
- **Docker**: Use included Dockerfile (planned)

## 🔧 Development Tips

- **Hot Reload**: Changes automatically reflect in browser
- **DevTools**: React and Redux DevTools supported
- **Debugging**: Source maps enabled for easy debugging
- **Code Splitting**: Automatic code splitting for optimal performance

## 📚 Learn More

- [React Documentation](https://reactjs.org/)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [SkillBridge API Documentation](../docs/api_endpoints.md)
