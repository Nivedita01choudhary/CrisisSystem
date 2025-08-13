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
    
    // Base response structure
    let response = '';
    
    if (crisisLevel.level === 'critical') {
      response = this.generateCriticalResponse(message, context);
    } else if (crisisLevel.level === 'high') {
      response = this.generateHighCrisisResponse(message, context, messageCount);
    } else if (crisisLevel.level === 'medium') {
      response = this.generateMediumCrisisResponse(message, context, messageCount);
    } else {
      response = this.generateLowCrisisResponse(message, context, messageCount);
    }
    
    // Add dynamic content based on specific themes
    if (themes.includes('work') || themes.includes('job')) {
      response += '\n\nWork stress can be overwhelming. What specific aspect is most challenging?';
    } else if (themes.includes('relationship') || themes.includes('partner') || themes.includes('family')) {
      response += '\n\nRelationship issues can be really difficult. Would you like to talk more about this?';
    } else if (themes.includes('sleep') || themes.includes('tired') || themes.includes('exhausted')) {
      response += '\n\nSleep issues often affect our mental health. How long has this been going on?';
    } else if (themes.includes('lonely') || themes.includes('alone') || themes.includes('isolated')) {
      response += '\n\nFeeling lonely can be really hard. What would help you feel more connected?';
    } else if (themes.includes('future') || themes.includes('hopeless') || themes.includes('no point')) {
      response += '\n\nIt sounds like you\'re struggling with hope for the future. What would make a difference?';
    }
    
    return response;
  }

  extractThemes(message) {
    const themes = [];
    
    if (message.includes('work') || message.includes('job') || message.includes('career') || message.includes('boss')) {
      themes.push('work');
    }
    if (message.includes('relationship') || message.includes('partner') || message.includes('family') || message.includes('friend')) {
      themes.push('relationship');
    }
    if (message.includes('sleep') || message.includes('tired') || message.includes('exhausted') || message.includes('rest')) {
      themes.push('sleep');
    }
    if (message.includes('lonely') || message.includes('alone') || message.includes('isolated') || message.includes('no one')) {
      themes.push('lonely');
    }
    if (message.includes('future') || message.includes('hopeless') || message.includes('no point') || message.includes('pointless')) {
      themes.push('future');
    }
    if (message.includes('money') || message.includes('financial') || message.includes('bills') || message.includes('debt')) {
      themes.push('financial');
    }
    if (message.includes('health') || message.includes('sick') || message.includes('pain') || message.includes('medical')) {
      themes.push('health');
    }
    
    return themes;
  }

  generateDynamicFollowUps(message, crisisLevel, context) {
    const lowerMessage = message.toLowerCase();
    const themes = this.extractThemes(lowerMessage);
    
    let followUps = [];
    
    // Generate follow-ups based on specific themes
    if (themes.includes('work')) {
      followUps.push('What\'s the most stressful part of your work situation?');
      followUps.push('Have you talked to anyone at work about how you\'re feeling?');
    }
    if (themes.includes('relationship')) {
      followUps.push('What would help improve your relationship situation?');
      followUps.push('Have you tried talking to the person you\'re having issues with?');
    }
    if (themes.includes('sleep')) {
      followUps.push('What\'s your sleep routine like?');
      followUps.push('Have you tried any relaxation techniques before bed?');
    }
    if (themes.includes('lonely')) {
      followUps.push('What activities usually help you feel less alone?');
      followUps.push('Is there someone you could reach out to right now?');
    }
    if (themes.includes('future')) {
      followUps.push('What would make you feel more hopeful about the future?');
      followUps.push('What\'s one small thing you could do today to help yourself?');
    }
    if (themes.includes('financial')) {
      followUps.push('What\'s the most pressing financial concern right now?');
      followUps.push('Have you looked into any financial assistance programs?');
    }
    if (themes.includes('health')) {
      followUps.push('How long have you been dealing with these health issues?');
      followUps.push('Have you talked to a doctor about how this affects your mental health?');
    }
    
    // Add crisis-level specific follow-ups
    if (crisisLevel.level === 'critical') {
      followUps.unshift('Are you currently in a safe place?');
      followUps.unshift('Do you have someone you can call right now?');
    } else if (crisisLevel.level === 'high') {
      followUps.unshift('How long have you been feeling this way?');
      followUps.unshift('Have you talked to anyone about these feelings?');
    } else if (crisisLevel.level === 'medium') {
      followUps.unshift('What\'s been causing you to feel this way?');
      followUps.unshift('Have you tried any coping strategies?');
    } else {
      followUps.unshift('What\'s been on your mind lately?');
      followUps.unshift('How can I best support you right now?');
    }
    
    // Return unique follow-ups (max 3)
    return followUps.filter((item, index) => followUps.indexOf(item) === index).slice(0, 3);
  }

  generateCriticalResponse(message, context) {
    return `I'm very concerned about what you're saying. Your life has value.

Please call 988 immediately - the National Suicide Prevention Lifeline is available 24/7.

If you're in immediate danger, call 911 or go to the nearest emergency room.

I'm here to listen, but professional help is available.`;
  }

  generateHighCrisisResponse(message, context, messageCount) {
    if (messageCount === 1) {
      return `I hear you're going through a difficult time. Depression and hopelessness are treatable.

You don't have to go through this alone. Would you like to talk more about what's been going on?

Remember, seeking help is a sign of strength.`;
    } else {
      return `I can see this has been hard for you. Have you considered talking to a mental health professional?

What would it be like to reach out to someone you trust?

Things can get better, even when it doesn't feel like it right now.`;
    }
  }

  generateMediumCrisisResponse(message, context, messageCount) {
    if (messageCount === 1) {
      return `I understand you're feeling overwhelmed and stressed. These feelings are normal and manageable.

What's been causing you to feel this way? I'm here to listen.

Have you tried any coping strategies that worked before?`;
    } else {
      return `I can see this has been affecting you. Have you considered talking to a counselor?

What would help you feel more grounded right now?

Remember, it's okay to ask for help.`;
    }
  }

  generateLowCrisisResponse(message, context, messageCount) {
    if (messageCount === 1) {
      return `I'm sorry you're not feeling your best right now. It's completely normal to have days or periods where we feel down or struggle with our emotions.

Thank you for reaching out and sharing how you're feeling. That takes courage, and I'm here to listen and support you.

What's been going on that's been affecting how you feel? Sometimes just talking about what's on our minds can help us process our emotions better.

Is there anything specific that usually helps you feel better when you're having a tough time? Everyone has different things that work for them.`;
    } else {
      return `I appreciate you continuing to share with me. It sounds like you've been going through a challenging time, and I want you to know that it's okay to not be okay sometimes.

How have you been coping with these feelings? Sometimes it helps to recognize the small ways we're already taking care of ourselves.

What would feel supportive to you right now? I'm here to listen, and I want to help in whatever way would be most helpful for you.

Remember, healing and feeling better often happens gradually, and it's okay to take things one day at a time.`;
    }
  }

  generateSuggestions(crisisLevel) {
    const suggestions = {
      low: [
        'Practice deep breathing exercises',
        'Take a walk outside in nature',
        'Talk to a friend or family member',
        'Write down your thoughts and feelings',
        'Try some gentle stretching or yoga',
        'Listen to calming music',
        'Do something you usually enjoy'
      ],
      medium: [
        'Consider talking to a mental health professional',
        'Practice mindfulness or meditation',
        'Establish a daily routine',
        'Limit caffeine and alcohol',
        'Get adequate sleep',
        'Exercise regularly',
        'Connect with supportive people'
      ],
      high: [
        'Please call a crisis hotline (988)',
        'Contact a mental health professional immediately',
        'Reach out to a trusted friend or family member',
        'Consider going to an emergency room if needed',
        'Remove any means of self-harm from your environment',
        'Stay with someone you trust',
        'Focus on getting through the next hour'
      ],
      critical: [
        'Call 988 immediately - National Suicide Prevention Lifeline',
        'Go to the nearest emergency room',
        'Call 911 if you are in immediate danger',
        'Text HOME to 741741 for Crisis Text Line',
        'Stay with someone you trust',
        'Remove any dangerous items from your environment',
        'Remember that this feeling is temporary'
      ]
    };
    
    return suggestions[crisisLevel] || suggestions.low;
  }

  getEmergencyContacts() {
    return [
      '988 - National Suicide Prevention Lifeline (24/7)',
      '741741 - Crisis Text Line (Text HOME)',
      '911 - Emergency Services',
      '800-273-8255 - National Suicide Prevention Lifeline (Alternative)'
    ];
  }

  updateUserContext(conversationId, message, crisisLevel) {
    const context = this.userContext.get(conversationId) || {};
    
    if (!context.crisisHistory) context.crisisHistory = [];
    context.crisisHistory.push({
      level: crisisLevel.level,
      timestamp: new Date(),
      message: message
    });
    
    context.crisisHistory = context.crisisHistory.slice(-5);
    
    const recentLevels = context.crisisHistory.map(h => h.level);
    if (recentLevels.includes('critical')) {
      context.overallTrend = 'escalating';
    } else if (recentLevels.includes('high')) {
      context.overallTrend = 'concerning';
    } else if (recentLevels.includes('medium')) {
      context.overallTrend = 'moderate';
    } else {
      context.overallTrend = 'stable';
    }
    
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

// Use environment variable for port (Azure requirement)
const PORT = process.env.PORT || 3001;

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

server.listen(PORT, () => {
  console.log(`🚀 Crisis Intervention Server running on port ${PORT}`);
  console.log(`🤖 Intelligent Response System: Active`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 