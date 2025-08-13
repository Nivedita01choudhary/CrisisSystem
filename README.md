# Crisis Intervention Chatbot

An AI-powered crisis intervention and mental health support system designed to provide immediate assistance to individuals in distress.

## Features

- 🤖 **AI-Powered Chat**: Real-time crisis intervention using OpenAI GPT-4
- 🚨 **Risk Assessment**: Advanced risk level detection and appropriate response escalation
- 🔒 **Secure Authentication**: User registration and login with JWT tokens
- 💬 **Real-time Chat**: WebSocket-based chat interface with typing indicators
- 📱 **Responsive Design**: Modern, mobile-friendly UI with beautiful animations
- 🛡️ **Safety Planning**: Personalized safety plan creation and management
- 📚 **Resource Library**: Comprehensive mental health resources and emergency contacts
- ⚡ **24/7 Availability**: Round-the-clock support system

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Socket.io** for real-time communication
- **JWT** for authentication
- **OpenAI API** for AI-powered responses
- **MongoDB** (ready for integration)
- **bcryptjs** for password hashing
- **Helmet** for security headers

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Axios** for API calls
- **Socket.io Client** for real-time features

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crisis-intervention-chatbot
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_here
   
   # Database (MongoDB)
   MONGODB_URI=your_mongodb_connection_string
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   # Terminal 1 - Start server
   npm run server
   
   # Terminal 2 - Start client
   npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
crisis-intervention-chatbot/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── chat.js       # Chat functionality
│   │   └── crisis.js     # Crisis intervention
│   └── index.js          # Server entry point
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Chat
- `POST /api/chat/save` - Save chat message
- `GET /api/chat/history` - Get chat history

### Crisis Intervention
- `POST /api/crisis/assess` - Assess crisis situation
- `GET /api/crisis/resources` - Get emergency resources
- `POST /api/crisis/safety-plan` - Create safety plan

## Key Features Explained

### Crisis Assessment
The system uses OpenAI's GPT-4 to analyze user messages and assess risk levels:
- **LOW**: General stress, mild anxiety
- **MEDIUM**: Moderate distress, some risk factors
- **HIGH**: Severe distress, immediate risk
- **CRITICAL**: Immediate danger, requires emergency response

### Safety Planning
Users can create personalized safety plans including:
- Warning signs and triggers
- Coping strategies
- Support contacts
- Emergency contacts
- Reasons to live
- Professional help information

### Real-time Communication
WebSocket integration provides:
- Instant message delivery
- Typing indicators
- Real-time risk level updates
- Emergency alerts for critical situations

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Express rate limiting to prevent abuse
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configured CORS for client-server communication
- **Input Validation**: Server-side validation for all inputs

## Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `MONGODB_URI`
- `NODE_ENV=production`
- `CLIENT_URL`

### Build Process
```bash
# Build the React app
cd client
npm run build

# The built files will be in client/build/
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## Disclaimer

This application is designed to provide immediate support and resources, but it is not a substitute for professional mental health care. If you're experiencing a mental health crisis, please contact emergency services or a mental health professional immediately.

## Emergency Resources

- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911

---

**Remember**: You're not alone. It's okay to ask for help. 💙 