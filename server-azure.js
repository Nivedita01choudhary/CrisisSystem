const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// Intelligent Response System
class IntelligentResponseService {
  constructor() {
    this.conversationHistory = new Map();
    this.userContext = new Map();
  }

  generateResponse(message, conversationId, userId) {
    const history = this.conversationHistory.get(conversationId) || [];
    const context = this.userContext.get(conversationId) || {};
    
    const crisisAssessment = this.assessCrisisLevel(message, history);
    const response = this.generateContextualResponse(message, crisisAssessment, context, history);
    
    // Update conversation history
    const newHistory = [
      ...history,
      { role: "user", content: message, timestamp: new Date() },
      { role: "assistant", content: response.message, timestamp: new Date() }
    ];
    this.conversationHistory.set(conversationId, newHistory.slice(-10));
    
    this.updateUserContext(conversationId, message, crisisAssessment);
    
    return response;
  }

  assessCrisisLevel(message, history) {
    const lowerMessage = message.toLowerCase();
    const keywords = [];
    
    // Critical indicators
    if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || 
        lowerMessage.includes('want to die') || lowerMessage.includes('end it all') ||
        lowerMessage.includes('no reason to live') || lowerMessage.includes('better off dead')) {
      keywords.push('suicide', 'self-harm', 'death');
      return { level: 'critical', confidence: 0.95, keywords };
    }
    
    // High indicators
    if (lowerMessage.includes('depressed') || lowerMessage.includes('hopeless') || 
        lowerMessage.includes('self-harm') || lowerMessage.includes('cut myself') ||
        lowerMessage.includes('hurt myself') || lowerMessage.includes('no hope')) {
      keywords.push('depression', 'hopelessness', 'self-harm');
      return { level: 'high', confidence: 0.85, keywords };
    }
    
    // Medium indicators
    if (lowerMessage.includes('anxiety') || lowerMessage.includes('panic') || 
        lowerMessage.includes('overwhelmed') || lowerMessage.includes('can\'t cope') ||
        lowerMessage.includes('stressed') || lowerMessage.includes('worried') ||
        lowerMessage.includes('demotivated') || lowerMessage.includes('tired')) {
      keywords.push('anxiety', 'stress', 'overwhelmed');
      return { level: 'medium', confidence: 0.75, keywords };
    }
    
    // Low indicators
    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || 
        lowerMessage.includes('not feeling good') || lowerMessage.includes('struggling') ||
        lowerMessage.includes('lonely') || lowerMessage.includes('alone')) {
      keywords.push('sadness', 'distress', 'loneliness');
      return { level: 'low', confidence: 0.65, keywords };
    }
    
    return { level: 'low', confidence: 0.5, keywords: [] };
  }

  generateContextualResponse(message, crisisLevel, context, history) {
    const messageCount = history.length / 2;
    
    // Generate dynamic response based on message content
    const response = this.generateDynamicResponse(message, crisisLevel, context, history);
    
    // Generate dynamic follow-up questions based on the message
    const followUpQuestions = this.generateDynamicFollowUps(message, crisisLevel, context);
    
    const suggestions = this.generateSuggestions(crisisLevel.level);
    const emergencyContacts = crisisLevel.level === 'critical' || crisisLevel.level === 'high' 
      ? this.getEmergencyContacts() 
      : undefined;
    
    return {
      message: response,
      crisisLevel,
      suggestions,
      emergencyContacts,
      followUpQuestions
    };
  }

  generateDynamicResponse(message, crisisLevel, context, history) {
    const lowerMessage = message.toLowerCase();
    const messageCount = history.length / 2;
    
    // Extract key themes from the message
    const themes = this.extractThemes(lowerMessage);
    
    // Generate response based on crisis level and themes
    let response = '';
    
    if (crisisLevel.level === 'critical') {
      response = "I'm very concerned about what you're sharing. Your safety is the most important thing right now. Please know that you're not alone and there are people who want to help you. Can you tell me more about what's happening? If you're in immediate danger, please call 988 or 911 right now.";
    } else if (crisisLevel.level === 'high') {
      response = "I can hear that you're going through a really difficult time. It sounds like you're feeling overwhelmed and in a lot of pain. You don't have to go through this alone. What would be most helpful for you right now?";
    } else if (crisisLevel.level === 'medium') {
      response = "I can sense that you're dealing with some challenging feelings. It's completely normal to feel this way when things are difficult. What's been the hardest part for you lately?";
    } else {
      response = "Thank you for sharing that with me. I'm here to listen and support you. How are you feeling right now?";
    }
    
    // Add personalized elements based on themes
    if (themes.includes('loneliness')) {
      response += ` I can hear that you're feeling lonely. That's a really painful feeling. Have you been able to connect with anyone recently?`;
    }
    
    if (themes.includes('stress')) {
      response += ` Stress can be really overwhelming. What helps you feel a little bit better when things get stressful?`;
    }
    
    return response;
  }

  extractThemes(message) {
    const themes = [];
    if (message.includes('alone') || message.includes('lonely')) themes.push('loneliness');
    if (message.includes('stress') || message.includes('overwhelmed')) themes.push('stress');
    if (message.includes('tired') || message.includes('exhausted')) themes.push('fatigue');
    if (message.includes('worry') || message.includes('anxious')) themes.push('anxiety');
    return themes;
  }

  generateDynamicFollowUps(message, crisisLevel, context) {
    const followUps = [];
    
    if (crisisLevel.level === 'critical') {
      followUps.push('Are you safe right now?');
      followUps.push('Do you have someone you can call?');
      followUps.push('What would help you feel safer?');
    } else if (crisisLevel.level === 'high') {
      followUps.push("What's been the hardest part of this?");
      followUps.push("Have you talked to anyone about how you're feeling?");
      followUps.push("What would be most helpful for you right now?");
    } else {
      followUps.push("How long have you been feeling this way?");
      followUps.push("What usually helps when you're feeling down?");
      followUps.push("Is there anything specific that's been difficult lately?");
    }
    
    return followUps;
  }

  generateSuggestions(crisisLevel) {
    const suggestions = {
      'critical': [
        'Call 988 - National Suicide Prevention Lifeline',
        "Call 911 if you're in immediate danger",
        'Go to the nearest emergency room',
        'Remove any means of self-harm from your environment',
        'Stay with someone you trust'
      ],
      'high': [
        'Call a crisis hotline',
        'Talk to a trusted friend or family member',
        'Consider speaking with a mental health professional',
        'Practice deep breathing exercises',
        'Remove yourself from harmful situations'
      ],
      'medium': [
        'Talk to someone you trust',
        'Practice self-care activities',
        'Consider professional counseling',
        'Exercise or go for a walk',
        'Write down your thoughts and feelings'
      ],
      'low': [
        'Practice mindfulness or meditation',
        'Connect with friends or family',
        'Engage in activities you enjoy',
        'Get adequate sleep and nutrition',
        'Consider talking to a counselor'
      ]
    };
    
    return suggestions[crisisLevel] || suggestions['low'];
  }

  getEmergencyContacts() {
    return [
      '988 - National Suicide Prevention Lifeline',
      '911 - Emergency Services',
      'Crisis Text Line: Text HOME to 741741',
      'Emergency Room - Go to nearest hospital'
    ];
  }

  updateUserContext(conversationId, message, crisisAssessment) {
    const context = this.userContext.get(conversationId) || {};
    context.lastCrisisLevel = crisisAssessment.level;
    context.lastMessageTime = new Date();
    context.messageCount = (context.messageCount || 0) + 1;
    this.userContext.set(conversationId, context);
  }

  clearHistory(conversationId) {
    this.conversationHistory.delete(conversationId);
    this.userContext.delete(conversationId);
  }
}

const intelligentResponseService = new IntelligentResponseService();

const app = express();
const server = http.createServer(app);

// Azure-optimized Socket.IO configuration
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://cts-vibeappce4614-1.azurewebsites.net", "*"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Use environment variable for port (Azure requirement) - FIXED PORT
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: ["http://localhost:3000", "https://cts-vibeappce4614-1.azurewebsites.net", "*"],
  credentials: true
}));
app.use(express.json());

// Redirect to dashboard
app.get('/', (req, res) => {
    res.redirect('/dashboard.html');
});

app.use(express.static('public'));

// Health check endpoint for Azure
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Crisis Intervention API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Azure-specific health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Crisis Intervention API',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO setup with intelligent responses
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('join-conversation', (data) => {
    socket.join(data.conversationId);
  });

  socket.on('send-message', (data) => {
    console.log(`Message: ${data.content}`);
    
    try {
      // Use intelligent response service
      const response = intelligentResponseService.generateResponse(
        data.content,
        data.conversationId,
        data.userId
      );
      
      const responseMessage = {
        id: Date.now(),
        content: response.message,
        senderType: 'BOT',
        timestamp: new Date(),
        crisisLevel: response.crisisLevel,
        suggestions: response.suggestions,
        emergencyContacts: response.emergencyContacts,
        followUpQuestions: response.followUpQuestions
      };
      
      io.to(data.conversationId).emit('new-message', responseMessage);
      
      // Log crisis level for monitoring
      if (response.crisisLevel.level === 'critical' || response.crisisLevel.level === 'high') {
        console.log(`⚠️ CRISIS ALERT - Level: ${response.crisisLevel.level}, Confidence: ${response.crisisLevel.confidence}`);
        console.log(`Keywords: ${response.crisisLevel.keywords.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Fallback response
      const fallbackMessage = {
        id: Date.now(),
        content: 'I\'m here to listen and support you. How are you feeling right now? If you\'re in crisis, please call 988 for immediate help.',
        senderType: 'BOT',
        timestamp: new Date(),
        crisisLevel: { level: 'low', confidence: 0.5, keywords: [] },
        suggestions: ['Take deep breaths', 'Talk to someone you trust', 'Consider professional help'],
        emergencyContacts: ['988 - National Suicide Prevention Lifeline']
      };
      
      io.to(data.conversationId).emit('new-message', fallbackMessage);
    }
  });

  socket.on('clear-conversation', (data) => {
    console.log(`Clearing conversation history: ${data.conversationId}`);
    intelligentResponseService.clearHistory(data.conversationId);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Crisis Intervention Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 Socket.IO: ws://localhost:${PORT}`);
  console.log(`🤖 AI Service: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled (No API Key)'}`);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 