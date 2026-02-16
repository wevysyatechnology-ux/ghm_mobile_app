import { knowledgeService } from '../services/knowledgeService';

/**
 * WeVysya Knowledge Base
 * Complete knowledge about the organization, members, houses, vision, etc.
 */

export const WEVYSYA_KNOWLEDGE = [
  // About WeVysya
  {
    content: `WeVysya is a revolutionary community network that transforms the concept of "I" to "WE". 
We are a community of professionals, entrepreneurs, and changemakers working together for collective growth.

Our tagline is "Stop thinking I, Start thinking WE" - representing the fundamental shift from individualism to collective consciousness.

WeVysya operates on the principle that together we are stronger, smarter, and more capable of achieving extraordinary things.`,
    metadata: {
      title: 'What is WeVysya?',
      category: 'about',
      source: 'core_knowledge',
    },
  },

  // Vision
  {
    content: `WeVysya's vision is to create a global network of conscious individuals who work together for collective prosperity.
We envision a world where resources, knowledge, and opportunities are shared freely within the community.
Our goal is to build the largest conscious community on the planet, where every member contributes to and benefits from collective growth.`,
    metadata: {
      title: 'WeVysya Vision',
      category: 'vision',
      source: 'core_knowledge',
    },
  },

  // Houses System
  {
    content: `WeVysya is organized into Houses - regional communities that bring members together based on location.
Each House has its own identity, leadership, and activities. Houses organize local events, meetings, and collaborations.
Houses provide a local anchor for the global WeVysya community, ensuring strong regional connections.
Examples include Hyderabad House, Bangalore House, Mumbai House, Delhi House, and many others across India and globally.`,
    metadata: {
      title: 'WeVysya Houses',
      category: 'houses',
      source: 'core_knowledge',
    },
  },

  // Membership
  {
    content: `WeVysya membership is open to professionals, entrepreneurs, and individuals committed to collective growth.
Members can be from any industry: Chartered Accountants, Lawyers, Doctors, Engineers, Entrepreneurs, and more.
Membership provides access to the network, resources, deals, events, and the i2we connection system.
Members are expected to contribute to the community through deals, links, knowledge sharing, and active participation.`,
    metadata: {
      title: 'WeVysya Membership',
      category: 'membership',
      source: 'core_knowledge',
    },
  },

  // i2we System
  {
    content: `i2we (I to WE) is WeVysya's unique connection system that transforms individual needs into collective opportunities.
When a member has a need or opportunity, they post an i2we request. The community then works together to fulfill it.
i2we embodies the core principle: your problem becomes our opportunity, and our collective strength solves individual challenges.
This system has created countless business connections, partnerships, and opportunities within the network.`,
    metadata: {
      title: 'i2we Connection System',
      category: 'features',
      source: 'core_knowledge',
    },
  },

  // Deals
  {
    content: `Deals in WeVysya are business opportunities shared among members.
Members can post deals for services, products, partnerships, or any business opportunity they want to share.
The platform enables members to find and connect with opportunities that align with their skills and interests.
Deals range from service requirements to large business partnerships, creating a thriving internal economy.`,
    metadata: {
      title: 'WeVysya Deals',
      category: 'features',
      source: 'core_knowledge',
    },
  },

  // Links
  {
    content: `Links are connection requests in WeVysya - a way to introduce people who should know each other.
When you know two members who could benefit from connecting, you can send a Link request.
This facilitates valuable introductions and strengthens the network effect within the community.
Links help build the interconnected web that makes WeVysya powerful.`,
    metadata: {
      title: 'WeVysya Links',
      category: 'features',
      source: 'core_knowledge',
    },
  },

  // Channels
  {
    content: `Channels in WeVysya are topic-based discussion spaces where members collaborate and share knowledge.
Channels can be based on industries, interests, projects, or any theme relevant to the community.
They provide focused spaces for meaningful conversations and collaborations.
Members can join channels that align with their interests and expertise.`,
    metadata: {
      title: 'WeVysya Channels',
      category: 'features',
      source: 'core_knowledge',
    },
  },

  // Events
  {
    content: `WeVysya organizes regular events including:
- House meetings: Local gatherings for each house
- National meetups: Large-scale events bringing the entire community together
- Workshops and training: Skill development and knowledge sharing sessions
- Social events: Community building and networking opportunities
Events are a core part of how WeVysya builds strong relationships and shared experiences.`,
    metadata: {
      title: 'WeVysya Events',
      category: 'events',
      source: 'core_knowledge',
    },
  },

  // Platform Features
  {
    content: `The WeVysya platform provides:
- Member directory: Find and connect with members by profession, location, or industry
- Voice AI Assistant: Natural language interface to interact with the platform
- Mobile and web access: Connect from anywhere
- Real-time messaging: Direct communication with members
- Activity feed: Stay updated on community happenings
- Profile management: Showcase your skills and offerings
The platform is designed to make collaboration effortless.`,
    metadata: {
      title: 'WeVysya Platform Features',
      category: 'platform',
      source: 'core_knowledge',
    },
  },

  // How to Use Voice Assistant
  {
    content: `The WeVysya Voice Assistant (WeVysya AI) can help you:
- Find members: "Find a CA in Bangalore" or "Find lawyers in Mumbai"
- Post deals: "Post a new deal" or "Create a business opportunity"
- Send links: "Send a link request" or "Introduce two members"
- Create i2we: "Create an i2we connection" or "I need help with..."
- View channels: "Show all channels" or "Browse communities"
- View activity: "Show recent activity" or "What's happening"
- Answer questions: Ask anything about WeVysya, houses, events, or members

Just speak naturally and the AI will understand your intent and help you.`,
    metadata: {
      title: 'How to Use Voice Assistant',
      category: 'help',
      source: 'core_knowledge',
    },
  },
];

/**
 * Load all knowledge into the database
 */
export async function loadKnowledgeBase(): Promise<void> {
  console.log('📚 Loading WeVysya knowledge base...');
  
  try {
    // Initialize knowledge base
    await knowledgeService.initializeKnowledgeBase();
    
    // Load all documents
    await knowledgeService.loadKnowledgeBase(WEVYSYA_KNOWLEDGE);
    
    console.log('✅ Knowledge base loaded successfully!');
    console.log(`📊 Total documents: ${WEVYSYA_KNOWLEDGE.length}`);
  } catch (error) {
    console.error('❌ Failed to load knowledge base:', error);
    throw error;
  }
}

/**
 * Add custom knowledge document
 */
export async function addKnowledge(
  content: string,
  title: string,
  category: string
): Promise<void> {
  await knowledgeService.addDocument({
    content,
    metadata: {
      title,
      category,
      source: 'custom',
    },
  });
}
