/**
 * 📚 Load WeVysya Knowledge Base
 * 
 * Standalone script that populates the knowledge base with essential information
 * Runs directly with Node.js without TypeScript compilation issues
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

if (!openaiApiKey) {
  console.error('⚠️ Warning: OPENAI_API_KEY not set. Embeddings will fail.');
  console.error('   Add it to your .env file to generate embeddings.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const KNOWLEDGE_DOCUMENTS = [
  // ===== Platform Information =====
  {
    content: `WeVysya is a revolutionary private business network exclusively for the Vysya community. 
It connects members across different business backgrounds through a trusted ecosystem. 
The platform enables members to collaborate, seek advice, share opportunities, and grow their businesses together.

Key features:
- Exclusive membership for Vysya community
- House-based social structure connecting members
- Business deal sharing and collaboration
- Professional networking and mentorship
- Knowledge sharing and community support`,
    metadata: {
      title: 'What is WeVysya?',
      category: 'general',
      source: 'platform_docs',
    },
  },

  {
    content: `WeVysya Membership Tiers:

1. GUEST: Free trial access (30 days)
   - Limited profile visibility
   - View deals and events
   - Cannot post deals or requests

2. MEMBER: Regular membership (₹2,000/year)
   - Full profile access
   - Post and browse deals
   - Send link requests
   - Join house activities

3. PRIME: Premium membership (₹5,000/year)
   - All MEMBER benefits
   - Priority support
   - Advanced search filters
   - Featured profile listings
   - Exclusive PRIME-only events`,
    metadata: {
      title: 'Membership Types',
      category: 'membership',
      source: 'platform_docs',
    },
  },

  {
    content: `WeVysya Houses are community clusters that organize members by:
- City/Location (e.g., Bangalore House, Mumbai House)
- Industry (e.g., Tech House, Manufacturing House)
- Interests (e.g., Startup Founders House, Family Business House)

Each house has:
- House Admin who manages members and activities
- Regular events and meetups
- Dedicated channels for discussions
- Collaborative business opportunities

Benefits of joining a house:
- Strong local network connections
- Industry-specific knowledge sharing
- Group deals and partnerships
- Regular offline meetups`,
    metadata: {
      title: 'What are Houses?',
      category: 'houses',
      source: 'platform_docs',
    },
  },

  // ===== Features =====
  {
    content: `WeVysya Deals are business opportunities shared by members:

Types of deals:
- BUY: Member looking to purchase products/services
- SELL: Member offering products/services
- PARTNERSHIP: Seeking business collaboration
- INVESTMENT: Funding opportunities

How to post a deal:
1. Go to Discover tab
2. Click "Post Deal" 
3. Fill in title, description, amount, type, and tags
4. Set visibility (public or house-only)
5. Submit and wait for interested members to contact you

Members can:
- Browse deals by category/tags
- Bookmark interesting deals
- Direct message deal posters
- Share deals within their house`,
    metadata: {
      title: 'How to Post and Browse Deals',
      category: 'deals',
      source: 'user_guide',
    },
  },

  {
    content: `Link Requests are personalized connection requests on WeVysya:

When to send a link:
- Need expert advice or consultation
- Looking for business partnership
- Seeking mentorship
- Want to collaborate on a project
- Need introduction to specific industry

How to send a link:
1. Go to Links tab
2. Click "Send Link Request"
3. Select member(s) from your house
4. Write a personalized message explaining why you want to connect
5. Specify type: ADVICE, PARTNERSHIP, COLLABORATION, etc.

Members receive notification and can:
- Accept and start conversation
- Decline politely
- Request more information`,
    metadata: {
      title: 'How to Send Link Requests',
      category: 'links',
      source: 'user_guide',
    },
  },

  {
    content: `I2We (I-to-We) are structured one-on-one meetings between members:

Purpose:
- Deep-dive business discussions
- Mentorship sessions
- Partnership negotiations
- Knowledge transfer

How to create an I2We:
1. Go to Activity tab
2. Click "Create I2We"
3. Select member from your house
4. Choose date and time
5. Set agenda/topic
6. Send invitation

Features:
- Calendar integration
- Video call link generation
- Meeting notes and follow-ups
- Feedback and ratings after meeting

Best practices:
- Clear agenda before meeting
- Respect scheduled time
- Follow up with action items`,
    metadata: {
      title: 'What are I2We Meetings?',
      category: 'i2we',
      source: 'user_guide',
    },
  },

  // ===== Voice Assistant Actions =====
  {
    content: `Voice Assistant Actions:

You can use voice commands for:

1. SEARCH MEMBERS:
   "Find a CA in Bangalore"
   "Who are the lawyers in my house?"
   "Show me marketing experts"

2. POST DEALS:
   "I want to sell office furniture"
   "Post a deal to buy laptops"
   "Create a partnership opportunity"

3. SEND LINKS:
   "Send a link request to Rajesh"
   "Connect me with tax experts"

4. CREATE I2WE:
   "Schedule a meeting with Priya"
   "Create an I2We for next Tuesday"

5. VIEW ACTIVITY:
   "Show my recent activity"
   "What's new in my house?"

6. BROWSE CHANNELS:
   "Open tech discussions channel"
   "Show recent channel messages"

Just say "Hey WeVysya" and speak your command naturally!`,
    metadata: {
      title: 'Voice Assistant Commands',
      category: 'voice_assistant',
      source: 'user_guide',
    },
  },

  // ===== Community Guidelines =====
  {
    content: `WeVysya Community Guidelines:

1. Professional Conduct:
   - Treat all members with respect
   - Keep conversations professional
   - No spam or unsolicited promotions

2. Privacy and Trust:
   - Respect member privacy
   - Don't share member contact info without permission
   - Keep house discussions confidential

3. Quality Content:
   - Post genuine business opportunities
   - Provide accurate information in deals
   - Write clear and descriptive titles

4. Engagement:
   - Respond to requests within 48 hours
   - Update deal status when closed
   - Provide feedback after meetings

5. Reporting Issues:
   - Report spam or inappropriate content
   - Contact house admin for conflicts
   - Use in-app support for technical issues

Violations may result in:
- Warning from house admin
- Temporary suspension
- Membership revocation`,
    metadata: {
      title: 'Community Guidelines',
      category: 'guidelines',
      source: 'platform_docs',
    },
  },

  // ===== Member Professions =====
  {
    content: `Common member professions on WeVysya:

Business & Finance:
- Chartered Accountants (CA)
- Financial Advisors
- Investment Bankers
- Business Consultants

Legal:
- Corporate Lawyers
- Tax Lawyers
- Intellectual Property Lawyers

Technology:
- Software Engineers
- IT Consultants
- Digital Marketing Experts
- Product Managers

Manufacturing:
- Factory Owners
- Supply Chain Managers
- Quality Control Experts

Real Estate:
- Property Developers
- Real Estate Brokers
- Architects

Retail & Trade:
- Wholesalers
- Retail Business Owners
- Import/Export Specialists

Healthcare:
- Doctors
- Hospital Administrators
- Pharma Distributors

Education:
- Educational Institution Owners
- Training Providers
- EdTech Founders`,
    metadata: {
      title: 'Member Professions Directory',
      category: 'members',
      source: 'platform_data',
    },
  },

  // ===== FAQs =====
  {
    content: `Frequently Asked Questions:

Q: How do I upgrade from GUEST to MEMBER?
A: Go to Profile > Membership > Upgrade. Payment options include UPI, card, net banking.

Q: Can I be part of multiple houses?
A: Yes! You can join multiple houses based on your location, industry, and interests.

Q: Are my deal posts visible to everyone?
A: You can choose visibility: Public (all WeVysya members) or House-only (only your house members).

Q: How do I become a house admin?
A: House admins are appointed by WeVysya team based on active participation and community contribution.

Q: What if I receive spam or inappropriate content?
A: Use the Report button on any post/message. Our team reviews reports within 24 hours.

Q: Can I invite non-Vysya friends?
A: WeVysya is exclusively for the Vysya community. Invitations require verification of community membership.

Q: How is my data protected?
A: We use bank-grade encryption, never share data with third parties, and comply with Indian data protection laws.`,
    metadata: {
      title: 'Frequently Asked Questions',
      category: 'faq',
      source: 'support_docs',
    },
  },

  {
    content: `Vision: To create the world's most powerful private business network for the Vysya community, 
where every member can find the right person, opportunity, or advice to grow their business.

Mission: 
- Connect Vysya business owners and professionals globally
- Enable trust-based business collaborations
- Preserve and promote Vysya community values
- Democratize business opportunities for all members
- Build a legacy platform for future generations

Core Values:
1. Trust: Every connection is built on community trust
2. Collaboration: Win-win partnerships over competition
3. Excellence: Strive for highest quality in all interactions
4. Integrity: Honest and transparent business practices
5. Community First: Individual success through collective growth`,
    metadata: {
      title: 'WeVysya Vision and Mission',
      category: 'general',
      source: 'platform_docs',
    },
  },
];

async function generateEmbedding(text) {
  if (!openaiApiKey) {
    console.log('⚠️ Skipping embedding generation (no API key)');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ OpenAI embedding error:', error);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('❌ Failed to generate embedding:', error.message);
    return null;
  }
}

async function upsertDocument(doc) {
  try {
    // Check if document already exists
    const { data: existing } = await supabase
      .from('knowledge_base')
      .select('id')
      .eq('metadata->>title', doc.metadata.title)
      .eq('metadata->>category', doc.metadata.category)
      .limit(1);

    // If exists, skip insertion
    if (existing && existing.length > 0) {
      return { inserted: false, reason: 'already exists' };
    }

    // Generate embedding
    const embedding = await generateEmbedding(doc.content);

    // Insert document
    const { error } = await supabase
      .from('knowledge_base')
      .insert({
        content: doc.content,
        embedding: embedding,
        metadata: doc.metadata,
      });

    if (error) {
      return { inserted: false, reason: error.message };
    }

    return { inserted: true };
  } catch (error) {
    return { inserted: false, reason: error.message };
  }
}

async function loadKnowledgeBase() {
  console.log('📚 Starting knowledge base loading...\n');

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of KNOWLEDGE_DOCUMENTS) {
    try {
      const result = await upsertDocument(doc);
      if (result.inserted) {
        inserted++;
        console.log(`✅ [${inserted}/${KNOWLEDGE_DOCUMENTS.length}] ${doc.metadata.title}`);
      } else if (result.reason === 'already exists') {
        skipped++;
        console.log(`⏭️ [${skipped} skipped] ${doc.metadata.title}`);
      } else {
        failed++;
        console.error(`❌ Failed: ${doc.metadata.title} - ${result.reason}`);
      }
    } catch (error) {
      failed++;
      console.error(`❌ Failed to load: ${doc.metadata.title}`, error.message);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📚 Knowledge Base Loading Complete!');
  console.log('='.repeat(60));
  console.log(`✅ Inserted: ${inserted} documents`);
  console.log(`⏭️ Skipped: ${skipped} (already existed)`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(60));
  
  if (inserted > 0 || skipped === KNOWLEDGE_DOCUMENTS.length) {
    console.log('\n🧠 Voice OS Knowledge Brain is now ready!');
    console.log('Users can ask questions like:');
    console.log('  - "What is WeVysya?"');
    console.log('  - "How do I post a deal?"');
    console.log('  - "What are I2We meetings?"');
    console.log('  - "How do I upgrade my membership?"');
    console.log('\nNext step: Deploy classify-intent function and test complete flow!');
  }
}

// Run the script
loadKnowledgeBase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
