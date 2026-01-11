
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Camera, 
  FileSearch, 
  MessageSquare, 
  Send, 
  Loader2, 
  Zap,
  CheckCircle2,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  ListChecks,
  TrendingDown,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { GoogleGenAI, Type, LiveServerMessage, Modality, Blob } from "@google/genai";
import { CarbonState } from '../types';
import { EMISSION_FACTORS } from '../constants';

// Audio Encoding & Decoding Helpers
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface AIToolsProps {
  carbonState: CarbonState;
  setCarbonState: React.Dispatch<React.SetStateAction<CarbonState>>;
}

interface RoadmapStep {
  title: string;
  description: string;
  impact: string;
  timeline: string;
}

const AITools: React.FC<AIToolsProps> = ({ carbonState, setCarbonState }) => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'chat' | 'planner'>('scanner');
  
  // Bill Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ kwh?: number; error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  // Planner State
  const [isPlanning, setIsPlanning] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);

  // Voice State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isConnectingVoice, setIsConnectingVoice] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
    };
  }, []);

  const generateImpactPlan = async () => {
    setIsPlanning(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const travelMonthly = (carbonState.travel.distanceKm * EMISSION_FACTORS.TRAVEL[carbonState.travel.mode] * carbonState.travel.daysPerWeek * 4.3);
    const electricityMonthly = (carbonState.electricity.monthlyKwh * EMISSION_FACTORS.ELECTRICITY);
    const lpgMonthly = (carbonState.lpg.cylindersPerYear * EMISSION_FACTORS.LPG) / 12;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a 4-step "Carbon Reduction Roadmap" for a user with these stats:
          - Monthly Travel: ${travelMonthly.toFixed(1)}kg CO2 (Mode: ${carbonState.travel.mode})
          - Monthly Electricity: ${electricityMonthly.toFixed(1)}kg CO2 (${carbonState.electricity.monthlyKwh}kWh)
          - Monthly Cooking: ${lpgMonthly.toFixed(1)}kg CO2
          
          Identify the biggest leverage point and provide a structured plan. Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING, description: "Estimated monthly savings in kg CO2" },
                timeline: { type: Type.STRING, description: "e.g. Week 1, Month 1" }
              },
              required: ["title", "description", "impact", "timeline"]
            }
          }
        }
      });
      const data = JSON.parse(response.text || '[]');
      setRoadmap(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlanning(false);
    }
  };

  const stopVoiceAssistant = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsVoiceActive(false);
    setIsConnectingVoice(false);
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
  };

  const startVoiceAssistant = async () => {
    if (isVoiceActive) {
      stopVoiceAssistant();
      return;
    }

    setIsConnectingVoice(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!audioContextsRef.current) {
        audioContextsRef.current = {
          input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
          output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 })
        };
      }

      const { input: inputCtx, output: outputCtx } = audioContextsRef.current;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnectingVoice(false);
            setIsVoiceActive(true);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then((session) => {
                if (session) session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outputCtx,
                24000,
                1
              );
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error('Voice Assistant Error:', e);
            stopVoiceAssistant();
          },
          onclose: () => {
            setIsVoiceActive(false);
            setIsConnectingVoice(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: 'You are the EcoTrack Voice Assistant. Help users with carbon footprint reduction. Be brief, cheerful, and sound human.',
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error('Failed to start voice assistant:', err);
      setIsConnectingVoice(false);
      setIsVoiceActive(false);
      alert('Could not establish voice connection. Please check your network and try again.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              {
                inlineData: { mimeType: file.type, data: base64Data },
              },
              {
                text: "Analyze this utility bill. Extract the total monthly units consumed in kWh. Return the result in JSON format with a single key 'kwh'. If not found, return an error message.",
              },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                kwh: { type: Type.NUMBER },
                error: { type: Type.STRING }
              }
            }
          }
        });

        const data = JSON.parse(response.text || '{}');
        if (data.kwh) {
          setScanResult({ kwh: data.kwh });
          setCarbonState(prev => ({
            ...prev,
            electricity: { monthlyKwh: data.kwh }
          }));
        } else {
          setScanResult({ error: data.error || 'Could not find kWh value on bill.' });
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setScanResult({ error: 'An error occurred during analysis.' });
      setIsScanning(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "You are the EcoTrack AI Assistant. You help users understand their carbon footprint and provide sustainability advice. Be encouraging, concise, and scientifically accurate.",
        }
      });

      const response = await chat.sendMessage({ message: userMsg });
      setChatHistory(prev => [...prev, { role: 'ai', text: response.text || 'Sorry, I encountered an error.' }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Oops! I am having trouble connecting right now.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-100">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Suite</h1>
          <p className="text-slate-500">Intelligent tools to simplify your sustainability journey.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-2xl mb-8 max-w-lg">
        <button 
          onClick={() => setActiveTab('scanner')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all ${activeTab === 'scanner' ? 'bg-white shadow-sm text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Camera size={18} />
          <span>Scanner</span>
        </button>
        <button 
          onClick={() => setActiveTab('planner')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all ${activeTab === 'planner' ? 'bg-white shadow-sm text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ListChecks size={18} />
          <span>Impact Planner</span>
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-white shadow-sm text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <MessageSquare size={18} />
          <span>Advisor</span>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'scanner' && (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <FileSearch className="mr-2 text-emerald-600" size={24} />
                Electricity Bill Analyzer
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Skip manual entry. Upload a clear photo of your monthly electricity bill, and our AI will automatically extract your kWh usage.
              </p>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera size={32} />
                </div>
                <p className="font-bold text-slate-900">Drop bill or click to scan</p>
                <p className="text-sm text-slate-400 mt-2">Supports JPG, PNG (Max 5MB)</p>
              </div>
            </div>

            <div className="space-y-6">
              {isScanning && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex flex-col items-center justify-center animate-pulse">
                  <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
                  <p className="text-emerald-800 font-bold">Scanning Document...</p>
                  <p className="text-emerald-600 text-sm mt-1">Extracting consumption data using Gemini</p>
                </div>
              )}

              {scanResult && !isScanning && (
                <div className={`rounded-3xl p-8 border ${scanResult.error ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className={`text-lg font-bold ${scanResult.error ? 'text-red-800' : 'text-emerald-800'}`}>
                        {scanResult.error ? 'Analysis Failed' : 'Scan Successful'}
                      </h3>
                      <p className="text-sm opacity-70">
                        {scanResult.error ? 'Please try a clearer photo' : 'Data has been synced to your profile'}
                      </p>
                    </div>
                    {scanResult.error ? <AlertCircle className="text-red-500" /> : <CheckCircle2 className="text-emerald-500" />}
                  </div>

                  {!scanResult.error && (
                    <div className="flex items-center justify-between bg-white/60 p-6 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <Zap className="text-amber-500" />
                        <span className="font-medium text-slate-700">Monthly Usage</span>
                      </div>
                      <span className="text-3xl font-black text-emerald-700">{scanResult.kwh} kWh</span>
                    </div>
                  )}
                  {scanResult.error && (
                    <p className="text-red-700 font-medium italic">"{scanResult.error}"</p>
                  )}
                </div>
              )}

              {!isScanning && !scanResult && (
                <div className="bg-slate-100/50 border border-slate-200 border-dashed rounded-3xl p-8 text-center">
                  <p className="text-slate-400 italic">No document analyzed yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="space-y-8">
            <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-100">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <TrendingDown className="mr-2" size={28} />
                  Smart Reduction Roadmap
                </h2>
                <p className="text-emerald-100/80 max-w-xl mb-8">
                  Our AI engine analyzes your travel, electricity, and fuel patterns to build a step-by-step 
                  action plan for significant impact reduction.
                </p>
                <button 
                  onClick={generateImpactPlan}
                  disabled={isPlanning}
                  className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center disabled:opacity-50"
                >
                  {isPlanning ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Analyzing data...
                    </>
                  ) : (
                    <>
                      Generate My Plan
                      <ChevronRight className="ml-2" size={20} />
                    </>
                  )}
                </button>
              </div>
              <Sparkles className="absolute -bottom-10 -right-10 text-white/5" size={200} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {roadmap.length > 0 ? (
                roadmap.map((step, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-xl">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {step.timeline}
                        </span>
                        <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                          -{step.impact}kg CO2
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{step.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))
              ) : !isPlanning && (
                <div className="md:col-span-2 flex flex-col items-center justify-center py-20 bg-slate-100/30 rounded-3xl border-2 border-dashed border-slate-200">
                  <ListChecks className="text-slate-300 mb-4" size={48} />
                  <p className="text-slate-400 font-medium">Ready to see your reduction path?</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[600px] overflow-hidden relative">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-emerald-50/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Eco Advisor</h2>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Always Online</p>
                </div>
              </div>
              <button 
                onClick={startVoiceAssistant}
                disabled={isConnectingVoice}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  isVoiceActive 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {isConnectingVoice ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : isVoiceActive ? (
                  <>
                    <MicOff size={20} />
                    <span className="font-bold text-sm">Stop Talk</span>
                  </>
                ) : (
                  <>
                    <Mic size={20} />
                    <span className="font-bold text-sm">Start Talk</span>
                  </>
                )}
              </button>
            </div>

            {isVoiceActive && (
              <div className="absolute inset-x-0 top-[89px] bottom-0 bg-emerald-900/95 z-10 flex flex-col items-center justify-center text-white p-10">
                <div className="mb-10 relative">
                  <div className="w-32 h-32 bg-emerald-500/20 rounded-full absolute -inset-4 animate-ping" />
                  <div className="w-32 h-32 bg-emerald-400 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                    <Volume2 size={48} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Voice Assistant Active</h3>
                <p className="text-emerald-200 text-center max-w-sm mb-8 leading-relaxed">
                  I'm listening! Ask me about your carbon footprint, sustainability tips, or how to go green.
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-10">
                  <MessageSquare size={48} className="text-slate-200 mb-4" />
                  <h3 className="text-slate-400 font-medium">No messages yet</h3>
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 border-t border-slate-100">
              <div className="relative">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a sustainability question..."
                  className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || isChatting || isVoiceActive}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITools;
