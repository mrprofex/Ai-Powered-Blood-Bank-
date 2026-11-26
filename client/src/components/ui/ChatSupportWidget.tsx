import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  BloodDrop,
  Package,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../../../shared/constants/bloodNetwork.ts';
import type { BloodGroup, BloodComponent } from '../../../../shared/constants/bloodNetwork.ts';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  options?: ChatOption[];
  isLoading?: boolean;
}

interface ChatOption {
  id: string;
  label: string;
  action: 'availability' | 'units' | 'nearby' | 'request' | 'emergency' | 'help' | 'custom';
  payload?: Record<string, unknown>;
}

interface BloodAvailabilityData {
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsAvailable: number;
  facilityName: string;
  city: string;
  country: string;
  distanceKm?: number;
  lastUpdated: string;
}

const WORLDWIDE_CITIES = [
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, facilities: ['NYC Blood Center', 'Mount Sinai Blood Bank', 'NY Presbyterian Blood Bank'] },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, facilities: ['NHS Blood & Transplant London', 'London Blood Centre', 'Guy\'s Hospital Blood Bank'] },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, facilities: ['Japanese Red Cross Tokyo', 'Tokyo Metropolitan Blood Center', 'Keio University Blood Bank'] },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, facilities: ['Australian Red Cross Sydney', 'Royal Prince Alfred Blood Bank', 'St Vincent\'s Blood Bank'] },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, facilities: ['Canadian Blood Services Toronto', 'Toronto General Blood Bank', 'Sunnybrook Blood Bank'] },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, facilities: ['Health Sciences Authority Bloodbank', 'Singapore General Blood Bank', 'National University Blood Bank'] },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, facilities: ['Dubai Blood Donation Center', 'Al Maktoum Hospital Blood Bank', 'Mediclinic Blood Bank'] },
  { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, facilities: ['KEM Regional Blood Center', 'Tata Memorial Blood Bank', 'Lilavati Hospital Blood Bank'] },
  { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, facilities: ['Hemocentro São Paulo', 'Hospital das Clínicas Blood Bank', 'Beneficência Portuguesa Blood Bank'] },
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, facilities: ['DRK Blutspendedienst Berlin', 'Charité Blood Bank', 'Vivantes Blood Bank'] },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, facilities: ['Établissement Français du Sang Paris', 'Hôpital Saint-Louis Blood Bank', 'Pitié-Salpêtrière Blood Bank'] },
  { city: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, facilities: ['Hong Kong Red Cross Blood Transfusion Service', 'Queen Mary Hospital Blood Bank', 'Prince of Wales Blood Bank'] },
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, facilities: ['Korean Red Cross Seoul', 'Seoul National University Blood Bank', 'Asan Medical Center Blood Bank'] },
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, facilities: ['Sanquin Amsterdam', 'AMC Blood Bank', 'VUmc Blood Bank'] },
  { city: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, facilities: ['Blodcentralen Stockholm', 'Karolinska Blood Bank', 'Södersjukhuset Blood Bank'] },
];

function generateWorldwideBloodData(): BloodAvailabilityData[] {
  const data: BloodAvailabilityData[] = [];
  const now = new Date();
  
  WORLDWIDE_CITIES.forEach(({ city, country, facilities }) => {
    BLOOD_GROUPS.forEach((bloodGroup) => {
      BLOOD_COMPONENTS.forEach((component) => {
        facilities.forEach((facilityName) => {
          const baseUnits = Math.floor(Math.random() * 500) + 50;
          const variation = Math.floor(Math.random() * 100) - 50;
          const unitsAvailable = Math.max(0, baseUnits + variation);
          const daysAgo = Math.floor(Math.random() * 7);
          const lastUpdated = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
          
          data.push({
            bloodGroup,
            component,
            unitsAvailable,
            facilityName,
            city,
            country,
            distanceKm: Math.round((Math.random() * 50 + 1) * 10) / 10,
            lastUpdated,
          });
        });
      });
    });
  });
  
  return data;
}

const WORLDWIDE_BLOOD_DATA = generateWorldwideBloodData();

const CHAT_RESPONSES: Record<string, { content: string; options: ChatOption[] }> = {
  availability: {
    content: 'I can check blood availability worldwide. Here\'s what I found across major cities:',
    options: [
      { id: 'check-specific', label: 'Check Specific Blood Group', action: 'availability', payload: { step: 'blood-group' } },
      { id: 'check-nearby', label: 'Find Nearby Blood Banks', action: 'nearby' },
      { id: 'emergency', label: 'Emergency Request', action: 'emergency' },
      { id: 'help', label: 'Other Questions', action: 'help' },
    ],
  },
  units: {
    content: 'Current global inventory shows varying units across blood groups and components. Would you like to see specific data?',
    options: [
      { id: 'by-group', label: 'Units by Blood Group', action: 'availability', payload: { view: 'by-group' } },
      { id: 'by-component', label: 'Units by Component', action: 'availability', payload: { view: 'by-component' } },
      { id: 'low-stock', label: 'Low Stock Alerts', action: 'availability', payload: { view: 'low-stock' } },
      { id: 'help', label: 'Other Questions', action: 'help' },
    ],
  },
  nearby: {
    content: 'I can help you find nearby blood banks. Please allow location access or select a city:',
    options: [
      { id: 'major-cities', label: 'Browse Major Cities', action: 'nearby', payload: { view: 'cities' } },
      { id: 'use-location', label: 'Use My Location', action: 'nearby', payload: { view: 'location' } },
      { id: 'emergency', label: 'Emergency - Need Blood Now', action: 'emergency' },
      { id: 'help', label: 'Other Questions', action: 'help' },
    ],
  },
  request: {
    content: 'To create a blood request, you\'ll need to be logged in as a hospital coordinator. Would you like to proceed?',
    options: [
      { id: 'login-hospital', label: 'Login as Hospital Coordinator', action: 'custom', payload: { redirect: 'login', role: 'HOSPITAL_COORDINATOR' } },
      { id: 'public-search', label: 'Search Public Availability', action: 'availability' },
      { id: 'emergency', label: 'Emergency Request', action: 'emergency' },
      { id: 'help', label: 'Other Questions', action: 'help' },
    ],
  },
  emergency: {
    content: '🚨 EMERGENCY MODE ACTIVATED 🚨\n\nFor immediate blood emergencies:\n1. Contact your nearest hospital emergency department\n2. Call your local emergency services (911/112/999)\n3. Use the "Find Nearby Blood Banks" feature below\n\nI can show you the closest facilities with available stock.',
    options: [
      { id: 'find-nearby', label: 'Find Nearest Blood Banks', action: 'nearby', payload: { emergency: true } },
      { id: 'critical-types', label: 'Critical Blood Types (O-, AB+)', action: 'availability', payload: { view: 'critical' } },
      { id: 'contact-emergency', label: 'Emergency Contacts', action: 'custom', payload: { view: 'emergency-contacts' } },
      { id: 'help', label: 'Other Questions', action: 'help' },
    ],
  },
  help: {
    content: 'I\'m your Blood Network Assistant. I can help you with:',
    options: [
      { id: 'check-avail', label: 'Check Blood Availability', action: 'availability' },
      { id: 'check-units', label: 'Check Units Available', action: 'units' },
      { id: 'find-nearby', label: 'Find Nearby Blood Banks', action: 'nearby' },
      { id: 'create-request', label: 'Create Blood Request (Login Required)', action: 'request' },
      { id: 'emergency', label: 'Emergency Assistance', action: 'emergency' },
    ],
  },
  default: {
    content: 'I understand you\'re asking about blood services. Here are the main things I can help with:',
    options: [
      { id: 'check-avail', label: 'Check Blood Availability', action: 'availability' },
      { id: 'check-units', label: 'Check Units Available', action: 'units' },
      { id: 'find-nearby', label: 'Find Nearby Blood Banks', action: 'nearby' },
      { id: 'create-request', label: 'Create Blood Request (Login Required)', action: 'request' },
      { id: 'emergency', label: 'Emergency Assistance', action: 'emergency' },
    ],
  },
};

function getAvailabilitySummary(data: BloodAvailabilityData[], view?: string): string {
  if (view === 'by-group') {
    const summary = BLOOD_GROUPS.map((bg) => {
      const total = data.filter((d) => d.bloodGroup === bg).reduce((sum, d) => sum + d.unitsAvailable, 0);
      return `${bg}: ${total.toLocaleString()} units`;
    }).join('\n');
    return `📊 Units by Blood Group:\n${summary}`;
  }
  
  if (view === 'by-component') {
    const summary = BLOOD_COMPONENTS.map((bc) => {
      const total = data.filter((d) => d.component === bc).reduce((sum, d) => sum + d.unitsAvailable, 0);
      return `${bc}: ${total.toLocaleString()} units`;
    }).join('\n');
    return `📦 Units by Component:\n${summary}`;
  }
  
  if (view === 'low-stock') {
    const lowStock = data.filter((d) => d.unitsAvailable < 100);
    if (lowStock.length === 0) return '✅ No critical low-stock alerts at this time.';
    const summary = lowStock.slice(0, 10).map((d) => 
      `${d.facilityName} (${d.city}, ${d.country}): ${d.bloodGroup} ${d.component} - ${d.unitsAvailable} units`
    ).join('\n');
    return `⚠️ Low Stock Alerts (showing top 10):\n${summary}`;
  }
  
  if (view === 'critical') {
    const critical = data.filter((d) => 
      (d.bloodGroup === 'O-' || d.bloodGroup === 'AB+') && d.unitsAvailable > 0
    );
    const summary = critical.slice(0, 10).map((d) => 
      `${d.facilityName} (${d.city}, ${d.country}): ${d.bloodGroup} ${d.component} - ${d.unitsAvailable} units (${d.distanceKm}km)`
    ).join('\n');
    return `🩸 Critical Blood Types Available:\n${summary}`;
  }
  
  const totalUnits = data.reduce((sum, d) => sum + d.unitsAvailable, 0);
  const facilities = new Set(data.map((d) => d.facilityName)).size;
  const countries = new Set(data.map((d) => d.country)).size;
  
  return `🌍 Global Blood Network Status:\n• ${totalUnits.toLocaleString()} total units available\n• ${facilities} facilities across ${countries} countries\n• ${BLOOD_GROUPS.length} blood groups × ${BLOOD_COMPONENTS.length} components tracked`;
}

function getNearbyResults(data: BloodAvailabilityData[], city?: string): string {
  if (city) {
    const cityData = data.filter((d) => d.city.toLowerCase() === city.toLowerCase());
    if (cityData.length === 0) return `No data available for ${city}.`;
    const summary = cityData.slice(0, 10).map((d) => 
      `${d.facilityName}: ${d.bloodGroup} ${d.component} - ${d.unitsAvailable} units`
    ).join('\n');
    return `🏥 ${city} Blood Banks:\n${summary}`;
  }
  
  const cities = [...new Set(data.map((d) => `${d.city}, ${d.country}`))].slice(0, 15);
  return `🌍 Major Cities with Blood Banks:\n${cities.map((c) => `• ${c}`).join('\n')}\n\nSelect a city or use location services for precise results.`;
}

export function ChatSupportWidget({
  onNavigate,
  onLoginRequired,
}: {
  onNavigate?: (page: string) => void;
  onLoginRequired?: (role: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<ChatOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (content: string, options?: ChatOption[]) => {
    const newMessage: ChatMessage = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      options,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleOptionClick = (option: ChatOption) => {
    setSelectedOption(option);
    addUserMessage(option.label);
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      switch (option.action) {
        case 'availability': {
          const view = option.payload?.view as string | undefined;
          const summary = getAvailabilitySummary(WORLDWIDE_BLOOD_DATA, view);
          addBotMessage(summary, CHAT_RESPONSES.availability.options);
          break;
        }
        case 'units': {
          const view = option.payload?.view as string | undefined;
          const summary = getAvailabilitySummary(WORLDWIDE_BLOOD_DATA, view);
          addBotMessage(summary, CHAT_RESPONSES.units.options);
          break;
        }
        case 'nearby': {
          const city = option.payload?.city as string | undefined;
          const emergency = option.payload?.emergency as boolean | undefined;
          const summary = getNearbyResults(WORLDWIDE_BLOOD_DATA, city);
          const prefix = emergency ? '🚨 EMERGENCY - Nearest Facilities:\n\n' : '';
          addBotMessage(prefix + summary, CHAT_RESPONSES.nearby.options);
          break;
        }
        case 'request': {
          addBotMessage(CHAT_RESPONSES.request.content, CHAT_RESPONSES.request.options);
          break;
        }
        case 'emergency': {
          addBotMessage(CHAT_RESPONSES.emergency.content, CHAT_RESPONSES.emergency.options);
          break;
        }
        case 'help': {
          addBotMessage(CHAT_RESPONSES.help.content, CHAT_RESPONSES.help.options);
          break;
        }
        case 'custom': {
          const redirect = option.payload?.redirect as string | undefined;
          const role = option.payload?.role as string | undefined;
          const view = option.payload?.view as string | undefined;
          
          if (redirect === 'login' && role) {
            addBotMessage(`Redirecting to login for ${role}...`);
            onLoginRequired?.(role);
          } else if (view === 'emergency-contacts') {
            addBotMessage(
              `📞 Emergency Contacts:\n\n` +
              `• International Emergency: 112\n• US Emergency: 911\n• UK Emergency: 999\n• India Emergency: 112\n• Australia Emergency: 000\n\n` +
              `For blood-specific emergencies, contact your nearest hospital blood bank directly.`,
              CHAT_RESPONSES.emergency.options
            );
          } else {
            addBotMessage(CHAT_RESPONSES.default.content, CHAT_RESPONSES.default.options);
          }
          break;
        }
      }
      setSelectedOption(null);
    }, 800);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userInput = inputValue.trim();
    setInputValue('');
    addUserMessage(userInput);
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const lower = userInput.toLowerCase();
      
      if (lower.includes('avail') || lower.includes('stock') || lower.includes('inventory')) {
        addBotMessage(getAvailabilitySummary(WORLDWIDE_BLOOD_DATA), CHAT_RESPONSES.availability.options);
      } else if (lower.includes('unit') || lower.includes('how many') || lower.includes('quantity')) {
        addBotMessage(getAvailabilitySummary(WORLDWIDE_BLOOD_DATA, 'by-group'), CHAT_RESPONSES.units.options);
      } else if (lower.includes('near') || lower.includes('close') || lower.includes('location') || lower.includes('where')) {
        addBotMessage(getNearbyResults(WORLDWIDE_BLOOD_DATA), CHAT_RESPONSES.nearby.options);
      } else if (lower.includes('request') || lower.includes('order') || lower.includes('need blood')) {
        addBotMessage(CHAT_RESPONSES.request.content, CHAT_RESPONSES.request.options);
      } else if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('critical') || lower.includes('help')) {
        addBotMessage(CHAT_RESPONSES.emergency.content, CHAT_RESPONSES.emergency.options);
      } else {
        addBotMessage(CHAT_RESPONSES.default.content, CHAT_RESPONSES.default.options);
      }
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      addBotMessage(
        '👋 Welcome to Blood Network Support! I can help you with blood availability, units, nearby banks, and emergency requests.',
        CHAT_RESPONSES.help.options
      );
    }
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 rounded-full shadow-xl transition-all duration-300 ${
          isOpen
            ? 'h-14 w-14 bg-[#C93440] text-white'
            : 'h-14 w-14 bg-[#123D2B] text-white hover:bg-[#1D593E]'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat support'}
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessageSquare className="h-7 w-7" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#C93440] text-[10px] font-bold flex items-center justify-center animate-pulse">
            1
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-[#E5EDE8] overflow-hidden flex flex-col"
            role="dialog"
            aria-label="Chat Support"
          >
            <div className="flex items-center justify-between p-4 bg-[#123D2B] text-white border-b border-[#1D593E]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#C93440] flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Blood Network Assistant</p>
                  <p className="text-[11px] opacity-80">Online • Typically replies in seconds</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        message.type === 'user'
                          ? 'bg-[#123D2B] text-white rounded-br-md'
                          : 'bg-[#E5EDE8] text-[#17231C] rounded-bl-md'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === 'bot' && (
                          <div className="h-6 w-6 rounded-full bg-[#C93440] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-60">
                        <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {message.type === 'user' && <User className="h-3 w-3" />}
                        {message.type === 'bot' && <Bot className="h-3 w-3" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-[#E5EDE8] text-[#17231C] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-[#123D2B] animate-spin" />
                      <span className="text-sm">Typing...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {selectedOption && (
              <div className="border-t border-[#E5EDE8] p-3 bg-[#F8FAF9]">
                <div className="flex items-center gap-2 text-sm text-[#55655C]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#123D2B]" />
                  Processing: {selectedOption.label}...
                </div>
              </div>
            )}

            <div className="border-t border-[#E5EDE8] p-3 bg-white">
              {messages.length > 0 && messages[messages.length - 1]?.options && (
                <div className="flex flex-wrap gap-2 mb-2" role="list" aria-label="Quick options">
                  {messages[messages.length - 1].options?.slice(0, 4).map((option) => (
                    <motion.button
                      key={option.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={() => handleOptionClick(option)}
                      className="clinical-btn px-3 py-1.5 rounded-full text-[11px] font-medium text-[#123D2B] hover:bg-[#E5EDE8] border border-[#C9D8CC] whitespace-nowrap"
                      role="listitem"
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question..."
                  className="flex-1 h-10 px-4 py-2 text-sm bg-[#F8FAF9] border border-[#C9D8CC] rounded-xl focus:border-[#123D2B] focus:outline-none focus:ring-1 focus:ring-[#123D2B]"
                  aria-label="Chat message input"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="h-10 w-10 rounded-xl bg-[#123D2B] text-white flex items-center justify-center hover:bg-[#1D593E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { WORLDWIDE_BLOOD_DATA, WORLDWIDE_CITIES };