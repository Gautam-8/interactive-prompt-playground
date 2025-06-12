'use client';

import { useState } from 'react';
import { Play, Trash2, Settings, Zap, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';

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

interface PromptComparison {
  changes: string;  // Combined changes and effects
}

interface TestResult {
  config: PromptConfig;
  output: string;
  error?: string;
  timestamp: string;
}

interface ResultGroup {
  prompt: string;
  results: TestResult[];
  comparison?: PromptComparison;
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

  // Function to get explanation for temperature change
  const getTemperatureExplanation = (prev: number, current: number): string => {
    const diff = current - prev;
    if (diff > 0.3) return "resulting in much more creative and diverse responses";
    if (diff > 0) return "leading to slightly more varied outputs";
    if (diff < -0.3) return "making responses much more focused and deterministic";
    return "producing slightly more consistent outputs";
  };

  // Function to get explanation for max tokens change
  const getTokensExplanation = (prev: number, current: number): string => {
    const diff = current - prev;
    if (diff > 100) return "allowing for significantly longer, more detailed responses";
    if (diff > 0) return "allowing for slightly more detailed outputs";
    if (diff < -100) return "making responses much more concise";
    return "producing more condensed outputs";
  };

  // Function to analyze parameter changes and their effects
  const generateComparison = (results: TestResult[]): PromptComparison | undefined => {
    if (results.length < 2) return undefined;

    const changes: string[] = [];
    const latestConfig = results[0].config;
    const previousConfig = results[1].config;

    // Compare model
    if (latestConfig.model !== previousConfig.model) {
      changes.push(
        latestConfig.model === 'gpt-4' 
          ? `Switched to ${latestConfig.model} for more nuanced understanding and complex reasoning`
          : `Switched to ${latestConfig.model} for faster responses while maintaining good quality`
      );
    }

    // Compare temperature
    if (latestConfig.temperature !== previousConfig.temperature) {
      changes.push(
        `Adjusted temperature from ${previousConfig.temperature} to ${latestConfig.temperature}, ${
          getTemperatureExplanation(previousConfig.temperature, latestConfig.temperature)
        }`
      );
    }

    // Compare max tokens
    if (latestConfig.maxTokens !== previousConfig.maxTokens) {
      changes.push(
        `Changed max tokens from ${previousConfig.maxTokens} to ${latestConfig.maxTokens}, ${
          getTokensExplanation(previousConfig.maxTokens, latestConfig.maxTokens)
        }`
      );
    }

    // Compare presence penalty
    if (latestConfig.presencePenalty !== previousConfig.presencePenalty) {
      const direction = latestConfig.presencePenalty > previousConfig.presencePenalty ? "increased" : "decreased";
      changes.push(
        `${direction} presence penalty from ${previousConfig.presencePenalty} to ${latestConfig.presencePenalty}, ${
          latestConfig.presencePenalty > previousConfig.presencePenalty
            ? "encouraging more diverse topic coverage"
            : "allowing more natural topic repetition"
        }`
      );
    }

    // Compare frequency penalty
    if (latestConfig.frequencyPenalty !== previousConfig.frequencyPenalty) {
      const direction = latestConfig.frequencyPenalty > previousConfig.frequencyPenalty ? "increased" : "decreased";
      changes.push(
        `${direction} frequency penalty from ${previousConfig.frequencyPenalty} to ${latestConfig.frequencyPenalty}, ${
          latestConfig.frequencyPenalty > previousConfig.frequencyPenalty
            ? "reducing word and phrase repetition"
            : "allowing more natural word patterns"
        }`
      );
    }

    // Compare stop sequence
    if (latestConfig.stopSequence !== previousConfig.stopSequence) {
      if (!previousConfig.stopSequence && latestConfig.stopSequence) {
        changes.push(
          `Added stop sequence "${latestConfig.stopSequence}", controlling where the response ends`
        );
      } else if (previousConfig.stopSequence && !latestConfig.stopSequence) {
        changes.push(
          `Removed stop sequence "${previousConfig.stopSequence}", allowing natural completion`
        );
      } else {
        changes.push(
          `Changed stop sequence from "${previousConfig.stopSequence}" to "${latestConfig.stopSequence}", modifying response termination`
        );
      }
    }

    if (changes.length === 0) return undefined;

    return {
      changes: changes.length === 1 
        ? changes[0] 
        : "Made multiple adjustments: " + changes.join("; ")
    };
  };

  // Function to group results by prompt
  const getGroupedResults = (results: TestResult[]): ResultGroup[] => {
    const groups = new Map<string, TestResult[]>();
    
    // Group by user prompt
    results.forEach(result => {
      const prompt = result.config.userPrompt;
      const group = groups.get(prompt) || [];
      groups.set(prompt, [...group, result]);
    });

    // Convert to array and sort groups by most recent result
    return Array.from(groups.entries())
      .map(([prompt, groupResults]) => {
        // Sort results within group by timestamp (most recent first)
        const sortedResults = groupResults.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return {
          prompt,
          results: sortedResults,
          comparison: generateComparison(sortedResults)
        };
      })
      // Sort groups by most recent result's timestamp
      .sort((a, b) => 
        new Date(b.results[0].timestamp).getTime() - new Date(a.results[0].timestamp).getTime()
      );
  };

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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Results</h2>
                </div>
                {results.length > 0 && (
                  <button
                    onClick={clearResults}
                    className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
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
                <div className="p-6 space-y-6">
                  {getGroupedResults(results).map((group, groupIndex) => (
                    <div key={groupIndex} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Prompt Card Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Settings className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Prompt</h3>
                            <p className="text-base text-gray-900">{group.prompt}</p>
                          </div>
                        </div>
                      </div>

                      {/* Response Cards */}
                      <div className="divide-y divide-gray-100">
                        {group.results.map((result, index) => {
                          const isFirstPrompt = index === group.results.length - 1; // Since results are sorted newest first
                          const isFirstAttemptOfNewPrompt = index === 0 && groupIndex > 0; // First attempt of a different prompt
                          
                          return (
                            <div 
                              key={index} 
                              className="bg-white"
                            >
                              {/* Config Bar */}
                              <div className="px-6 py-3 flex items-center justify-between bg-gray-50 border-y border-gray-100">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-3 text-sm">
                                    <span className={`px-2 py-1 rounded ${
                                      result.config.model === 'gpt-4' 
                                        ? 'bg-purple-100 text-purple-700' 
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {result.config.model}
                                    </span>
                                    <span className="text-gray-600">
                                      temp: {result.config.temperature}
                                    </span>
                                    <span className="text-gray-600">
                                      max tokens: {result.config.maxTokens}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">{result.timestamp}</span>
                              </div>

                              {/* Comparison with Previous (if exists and not first prompt or first of new prompt) */}
                              {!isFirstPrompt && !isFirstAttemptOfNewPrompt && index < group.results.length - 1 && (
                                <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-gray-100">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Changes: </span>
                                    {group.comparison?.changes}
                                  </p>
                                </div>
                              )}

                              {/* Result Content */}
                              <div className="px-6 py-4">
                                {result.error ? (
                                  <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                                    <p className="font-medium">Error</p>
                                    <p className="mt-1">{result.error}</p>
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
                          );
                        })}
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
