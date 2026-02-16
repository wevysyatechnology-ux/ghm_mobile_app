# 🎤 WeVysya Voice OS - Integration Guide

Quick start guide to integrate Voice OS into your existing WeVysya app.

## 1. Add Voice Button to Existing Screens

### Add to Header/Navigation

```typescript
import { Mic } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export function VoiceButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/voice-assistant')}
      className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center"
    >
      <Mic size={24} color="white" />
    </Pressable>
  );
}
```

### Add to Discover Screen (to search members by voice)

```typescript
import { VoiceButton } from '@/components/VoiceButton';

export default function DiscoverScreen() {
  return (
    <View>
      <View className="flex-row items-center justify-between p-4">
        <Text className="text-2xl font-bold">Discover</Text>
        <VoiceButton />
      </View>
      {/* Rest of screen */}
    </View>
  );
}
```

### Add as Floating Action Button

```typescript
import { FloatingVoiceButton } from '@/components/FloatingVoiceButton';

export default function TabLayout() {
  return (
    <View className="flex-1">
      {/* Tab content */}
      <FloatingVoiceButton />
    </View>
  );
}
```

## 2. Use Voice OS in Custom Components

### Search Members by Voice

```typescript
import { actionEngine } from '@/services/actionEngine';
import { knowledgeService } from '@/services/knowledgeService';
import { voiceOS } from '@/services/voiceOSService';

export function VoiceMemberSearch() {
  const [members, setMembers] = useState([]);

  const handleVoiceSearch = async (transcript: string) => {
    // Get relevant context
    const context = await knowledgeService.searchKnowledge(transcript);

    // Classify intent
    const intent = await actionEngine.classifyIntent(transcript, context);

    if (intent.action?.name === 'search_member') {
      // Execute search with extracted parameters
      const result = await actionEngine.executeAction(intent);
      setMembers(result.data);
    }
  };

  return (
    <View>
      {/* Search UI */}
    </View>
  );
}
```

### Post Deal with Voice

```typescript
import { voiceOS } from '@/services/voiceOSService';

export function VoiceDealForm() {
  const [dealDescription, setDealDescription] = useState('');

  const handleVoiceInput = async () => {
    // Record and transcribe
    await voiceOS.startRecording();
    const transcript = await voiceOS.stopRecordingAndTranscribe();
    
    // Use transcription as deal description
    setDealDescription(transcript);
  };

  return (
    <TextInput
      value={dealDescription}
      placeholder="Describe the deal..."
      onChangeText={setDealDescription}
      rightElement={
        <Pressable onPress={handleVoiceInput}>
          <Mic size={24} />
        </Pressable>
      }
    />
  );
}
```

### Answer Questions with Voice

```typescript
import { knowledgeService } from '@/services/knowledgeService';
import { actionEngine } from '@/services/actionEngine';

export function VoiceAssistant() {
  const [answer, setAnswer] = useState('');

  const handleQuestion = async (question: string) => {
    // Search knowledge base
    const context = await knowledgeService.searchKnowledge(question);

    // Get answer
    const intent = await actionEngine.classifyIntent(question, context);
    
    setAnswer(intent.response);

    // Speak the answer
    await voiceOS.speak(intent.response);
  };

  return (
    <View>
      <Text>{answer}</Text>
    </View>
  );
}
```

## 3. Initialize Knowledge Base on App Start

### In _layout.tsx

```typescript
import { loadKnowledgeBase } from '@/utils/knowledgeLoader';

export default function RootLayout() {
  useEffect(() => {
    const initializeVoiceOS = async () => {
      try {
        console.log('Initializing Voice OS...');
        await loadKnowledgeBase();
        console.log('Voice OS ready!');
      } catch (error) {
        console.error('Failed to initialize Voice OS:', error);
      }
    };

    initializeVoiceOS();
  }, []);

  return (
    // Your app layout
  );
}
```

### In Context Provider

```typescript
import { createContext, useEffect } from 'react';
import { loadKnowledgeBase } from '@/utils/knowledgeLoader';

export const VoiceOSContext = createContext(null);

export function VoiceOSProvider({ children }) {
  useEffect(() => {
    loadKnowledgeBase().catch(console.error);
  }, []);

  return (
    <VoiceOSContext.Provider value={null}>
      {children}
    </VoiceOSContext.Provider>
  );
}
```

## 4. Handle Voice Results in Navigation

### Navigate to Search Results

```typescript
import { useRouter } from 'expo-router';
import { actionEngine } from '@/services/actionEngine';

export async function handleVoiceCommand(transcript: string) {
  const context = await knowledgeService.searchKnowledge(transcript);
  const intent = await actionEngine.classifyIntent(transcript, context);

  if (intent.action?.screen) {
    // Auto-navigate to appropriate screen
    router.push(intent.action.screen as any);

    // Pass search parameters if available
    if (intent.action.parameters) {
      // Store in global state or context for the destination screen
      // to use for filtering
    }
  }
}
```

### Pass Search Context

```typescript
// Create a voice search context
export const VoiceSearchContext = createContext({
  profession: null,
  location: null,
});

// In voice assistant after classification
if (intent.action?.name === 'search_member') {
  voiceSearchContext.setValue(intent.action.parameters);
  router.push('/(tabs)/discover');
}

// In discover screen
const voiceSearch = useContext(VoiceSearchContext);
useEffect(() => {
  if (voiceSearch.profession || voiceSearch.location) {
    // Auto-filter results based on voice search
    filterMembers(voiceSearch);
  }
}, [voiceSearch]);
```

## 5. Add Custom Knowledge for Your Community

### Load on App Start

```typescript
import { addKnowledge } from '@/utils/knowledgeLoader';

async function initializeCustomKnowledge() {
  // Add house-specific information
  await addKnowledge(
    'Hyderabad House hosts weekly meetups every Friday at...',
    'Hyderabad House Meetups',
    'events'
  );

  // Add community guidelines
  await addKnowledge(
    'WeVysya community guidelines ensure respectful and collaborative...',
    'Community Guidelines',
    'policies'
  );

  // Add member success stories
  await addKnowledge(
    'John, a CA, connected with Priya, a lawyer, through WeVysya...',
    'Success Story: CA-Lawyer Partnership',
    'stories'
  );
}

initializeCustomKnowledge();
```

## 6. Add Voice to Existing Components

### Update Activity Feed

```typescript
export function ActivityFeedItem({ item }) {
  const handleSpeak = async () => {
    await voiceOS.speak(`${item.title}: ${item.message}`);
  };

  return (
    <View className="flex-row justify-between items-center p-4">
      <Text className="flex-1">{item.title}</Text>
      <Pressable onPress={handleSpeak}>
        <Volume2 size={20} />
      </Pressable>
    </View>
  );
}
```

### Update Member Cards

```typescript
export function MemberCard({ member }) {
  const handleVoiceIntro = async () => {
    const intro = `${member.name} is a ${member.category} based in ${member.location}`;
    await voiceOS.speak(intro);
  };

  return (
    <View className="rounded-lg p-4 bg-white">
      <Text className="font-bold">{member.name}</Text>
      <Text className="text-gray-600">{member.category}</Text>
      <Pressable onPress={handleVoiceIntro} className="mt-2">
        <Mic size={16} />
      </Pressable>
    </View>
  );
}
```

## 7. Test Voice Features Without Mic

### Mock Voice Input (For Testing)

```typescript
// In development/test mode
export async function testVoiceCommand(transcript: string) {
  console.log('Testing voice command:', transcript);
  
  const context = await knowledgeService.searchKnowledge(transcript);
  const intent = await actionEngine.classifyIntent(transcript, context);
  
  console.log('Intent Result:', intent);
  return intent;
}

// In UI
if (__DEV__) {
  <Pressable onPress={() => testVoiceCommand('Find a CA')}>
    <Text>Test Voice Search</Text>
  </Pressable>
}
```

## 8. Environment Setup Checklist

- [ ] Added `EXPO_PUBLIC_OPENAI_API_KEY` to `.env`
- [ ] Enabled `pgvector` extension in Supabase
- [ ] Ran database migration
- [ ] Knowledge base loads on app start
- [ ] Voice button added to key screens
- [ ] Tested with quick commands in voice assistant screen
- [ ] Tested with real voice input
- [ ] Added custom knowledge for your community
- [ ] Integrated voice results with navigation

## 9. Performance Tips

### Lazy Load Knowledge
```typescript
// Don't load everything immediately
const lazyLoadKnowledge = async () => {
  // Load core knowledge first
  await knowledgeService.loadKnowledgeBase(CORE_KNOWLEDGE);
  
  // Load extended knowledge on idle
  setTimeout(() => {
    knowledgeService.loadKnowledgeBase(EXTENDED_KNOWLEDGE);
  }, 5000);
};
```

### Cache Embeddings
```typescript
const embeddingCache = new Map();

export async function getEmbeddingCached(text: string) {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text);
  }
  // Generate and cache...
}
```

### Debounce Voice Recognition
```typescript
const debouncedVoiceCommand = debounce(
  (transcript) => voiceOS.processCommand(transcript),
  500
);
```

## 10. Troubleshooting Integration

### Voice Assistant Screen Not Found
```bash
# Make sure file exists and route is registered:
# app/voice-assistant.tsx

# Check app routing:
ls -la app/
```

### Knowledge Not Loading
```typescript
// Add debug logging
useEffect(() => {
  loadKnowledgeBase()
    .then(() => console.log('✅ Knowledge loaded'))
    .catch(error => console.error('❌ Knowledge failed:', error));
}, []);
```

### Commands Not Working
```typescript
// Test action engine directly
const intent = await actionEngine.classifyIntent('Find CA');
console.log('Intent:', intent);
// Should show type: 'action', action: { name: 'search_member' }
```

## Next: Voice-Powered Features

Once integrated, you can add:
- 🎤 Voice notifications ("You have 3 new deals")
- 🎯 Voice-based deal creation
- 📞 Voice-initiated calls
- 💬 Voice messaging
- 📊 Voice analytics ("Show me stats")
- 🔔 Voice reminders

---

**Need help? Check VOICE_OS_SETUP.md for detailed architecture documentation.**
