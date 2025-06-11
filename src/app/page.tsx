'use client';

import { useState } from 'react';
import { Play, Trash2, Settings, Zap } from 'lucide-react';

interface PromptConfig {
  systemPrompt: string;
  userPrompt: string;
  model: 'gpt-3.5-turbo' | 'gpt-4';
  temperature: number;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
  stopSequence: string;
}

interface TestResult {
  config: PromptConfig;
  output: string;
  error?: string;
  timestamp: string;
}

export default function Home() {
  const [config, setConfig] = useState<PromptConfig>({
    systemPrompt: 'You are an expert product description writer. Create compelling, detailed product descriptions that highlight key features and benefits.',
    userPrompt: 'Write a product description for: iPhone 15 Pro',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 150,
    presencePenalty: 0.0,
    frequencyPenalty: 0.0,
    stopSequence: '',
  });

  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async () => {
    setIsRunning(true);
    
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const newResult: TestResult = {
        config: { ...config },
        output: data.output,
        timestamp: new Date().toLocaleString(),
      };

      setResults(prev => [newResult, ...prev]);
    } catch (error) {
      const errorResult: TestResult = {
        config: { ...config },
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleString(),
      };
      
      setResults(prev => [errorResult, ...prev]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interactive Prompt Playground</h1>
              <p className="text-sm text-gray-600">Test AI parameters and see real-time results</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          
                     {/* Left Section - Configuration Form */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
               <div className="flex items-center gap-2">
                 <Settings className="w-5 h-5 text-blue-600" />
                 <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
               </div>
             </div>
             
             <div className="p-6 space-y-6 overflow-y-auto flex-1">
               {/* Prompts Section */}
               <div className="space-y-4">
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <label className="block text-sm font-medium text-gray-900">
                       System Prompt
                     </label>
                     <div className="flex items-center gap-2">
                       <span className="text-xs text-gray-600">Model:</span>
                       <select
                         value={config.model}
                         onChange={(e) => setConfig({ ...config, model: e.target.value as 'gpt-3.5-turbo' | 'gpt-4' })}
                         className="px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent text-gray-800"
                       >
                         <option value="gpt-3.5-turbo">3.5</option>
                         <option value="gpt-4">4.0</option>
                       </select>
                     </div>
                   </div>
                   <textarea
                     value={config.systemPrompt}
                     onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                     className="w-full h-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-800"
                     placeholder="Define the AI's role and behavior..."
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-900 mb-2">
                     User Prompt
                   </label>
                   <textarea
                     value={config.userPrompt}
                     onChange={(e) => setConfig({ ...config, userPrompt: e.target.value })}
                     className="w-full h-16 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-800"
                     placeholder="What do you want the AI to do?"
                   />
                 </div>
               </div>

               {/* Parameters */}
               <div className="space-y-6">
                 {/* Temperature and Max Tokens in one row */}
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <div className="flex justify-between items-center mb-3">
                       <label className="text-sm font-medium text-gray-900">Temperature</label>
                       <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                         {config.temperature}
                       </span>
                     </div>
                     <input
                       type="range"
                       min="0"
                       max="2"
                       step="0.1"
                       value={config.temperature}
                       onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                     />
                     <div className="flex justify-between text-xs text-gray-500 mt-1">
                       <span>Focused</span>
                       <span>Creative</span>
                     </div>
                   </div>

                   <div>
                     <div className="flex justify-between items-center mb-3">
                       <label className="text-sm font-medium text-gray-900">Max Tokens</label>
                       <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                         {config.maxTokens}
                       </span>
                     </div>
                     <input
                       type="range"
                       min="10"
                       max="500"
                       step="10"
                       value={config.maxTokens}
                       onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                     />
                     <div className="flex justify-between text-xs text-gray-500 mt-1">
                       <span>Short</span>
                       <span>Long</span>
                     </div>
                   </div>
                 </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-900">Presence</label>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {config.presencePenalty}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.presencePenalty}
                      onChange={(e) => setConfig({ ...config, presencePenalty: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-900">Frequency</label>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {config.frequencyPenalty}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.frequencyPenalty}
                      onChange={(e) => setConfig({ ...config, frequencyPenalty: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Stop Sequence (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.stopSequence}
                    onChange={(e) => setConfig({ ...config, stopSequence: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., ###"
                  />
                </div>
              </div>

                                          </div>
             
             {/* Action Button - Fixed at Bottom */}
             <div className="p-6 border-t border-gray-200 bg-gray-50">
               <button
                 onClick={runTest}
                 disabled={isRunning}
                 className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
               >
                 {isRunning ? (
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                   <Play className="w-4 h-4" />
                 )}
                 {isRunning ? 'Generating...' : 'Generate'}
               </button>
             </div>
           </div>

          {/* Right Section - Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Results {results.length > 0 && `(${results.length})`}
                  </h2>
                </div>
                {results.length > 0 && (
                  <button
                    onClick={clearResults}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Play className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
                  <p className="text-gray-600 max-w-sm">
                    Configure your prompts and parameters, then click "Generate Response" to see AI-powered results appear here.
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Result Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium text-gray-900">{result.config.model}</span>
                            <span className="text-gray-600">T:{result.config.temperature}</span>
                            <span className="text-gray-600">{result.config.maxTokens}t</span>
                            <span className="text-gray-600">P:{result.config.presencePenalty}</span>
                            <span className="text-gray-600">F:{result.config.frequencyPenalty}</span>
                          </div>
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        </div>
                      </div>

                      {/* Result Content */}
                      <div className="p-4">
                        {result.error ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                              <div>
                                <p className="font-medium text-red-800 mb-1">Error</p>
                                <p className="text-red-700 text-sm">{result.error}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {result.output}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
