import React, { useState, useEffect, useRef } from "react";
import { Story } from "@/entities/Story";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Loader2, Sparkles, FileText, Download, File, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

const INTERVIEW_QUESTIONS = [
  {
    id: "foundation",
    question: "Hello! I'm here to help you craft a powerful story that can make a difference. To begin, could you please tell me your name and the social issue you're most passionate about right now? (e.g., climate justice, mental health stigma, educational inequality, etc.)",
    field: "foundation_name_topic",
  },
  {
    id: "protagonist",
    question: "Thank you! Now, let's bring your issue to life through a character. Who is at the center of your story? Tell me about them—what is their name, their age, and what is one small, everyday hope or dream they hold onto?",
    field: "protagonist_details",
  },
  {
    id: "conflict",
    question: "Every story needs a challenge. Describe a specific moment or a recurring situation where your character directly confronts this social issue. What happens, and how does it stand in the way of the simple dream you just mentioned?",
    field: "conflict_challenge",
  },
  {
    id: "emotion",
    question: "Let's go deeper into their feelings. In that moment of struggle, what is the single, overwhelming emotion they feel? Is it a loud feeling like anger, or a quiet one like loneliness? What is a thought that keeps repeating in their mind?",
    field: "emotional_core",
  },
  {
    id: "hope",
    question: "Impactful stories often leave us with a sense of hope or a call to action. What is one small act of kindness, defiance, or hope that your character performs, or that someone else shows to them? Finally, what is the one message you want readers to take away from this story?",
    field: "turning_point_message",
  }
];

export default function InterviewPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [savedStoryId, setSavedStoryId] = useState(null);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Start the interview with the first question
    const firstQuestion = INTERVIEW_QUESTIONS[0];
    setMessages([{
      id: Date.now(),
      type: "bot",
      content: firstQuestion.question,
      timestamp: new Date()
    }]);
  }, []);

  const simulateTyping = async (message) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: "bot", 
      content: message,
      timestamp: new Date()
    }]);
    setIsTyping(false);
  };

  const handleSubmitResponse = async () => {
    if (!currentInput.trim()) return;

    const currentQuestion = INTERVIEW_QUESTIONS[currentQuestionIndex];
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setResponses(prev => ({
      ...prev,
      [currentQuestion.field]: currentInput
    }));

    setCurrentInput("");

    // Check if we're done with all questions
    if (currentQuestionIndex >= INTERVIEW_QUESTIONS.length - 1) {
      await simulateTyping("Thank you for sharing such a powerful and personal story. I have everything I need to craft something truly impactful. I'm now creating your story and a beautiful flyer to share it with the world. This might take a moment...");
      await generateStory({ ...responses, [currentQuestion.field]: currentInput });
      return;
    }

    // Move to next question
    const nextQuestionIndex = currentQuestionIndex + 1;
    const nextQuestion = INTERVIEW_QUESTIONS[nextQuestionIndex];
    
    setCurrentQuestionIndex(nextQuestionIndex);
    await simulateTyping(nextQuestion.question);
  };

  const generateStory = async (allResponses) => {
    setIsGenerating(true);
    
    try {
      // Generate the story
      const storyPrompt = `
Based on the following character-driven interview responses, craft a compelling and emotionally resonant social impact story. This should be a narrative story that brings the social issue to life through a relatable character.

Interview Responses:
Foundation & Topic: ${allResponses.foundation_name_topic}
Character Details: ${allResponses.protagonist_details}
The Conflict: ${allResponses.conflict_challenge}
Emotional Core: ${allResponses.emotional_core}
Hope & Message: ${allResponses.turning_point_message}

Create a story that:
1. Has a compelling, emotionally resonant title
2. Opens by introducing the character in their everyday world
3. Builds narrative tension through the specific conflict described
4. Captures the deep emotional experience of the character
5. Concludes with the act of hope/defiance and delivers the key message
6. Feels like a complete short story that could move readers to action

The tone should be authentic, emotionally engaging, and suitable for sharing on social media or in advocacy materials.

Return the story in a structured format with clear sections.
`;

      const storyResult = await InvokeLLM({
        prompt: storyPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            story_text: { type: "string" },
            key_message: { type: "string" },
            call_to_action: { type: "string" },
            character_name: { type: "string" }
          }
        }
      });

      // Parse the responses to extract structured data
      const parsedData = await InvokeLLM({
        prompt: `
Extract structured information from these story interview responses for database storage:
${Object.entries(allResponses).map(([key, value]) => `${key}: ${value}`).join('\n')}

Parse and return clean, structured information.
`,
        response_json_schema: {
          type: "object",
          properties: {
            storyteller_name: { type: "string" },
            community_issue: { type: "string" },
            character_name: { type: "string" },
            character_age: { type: "string" },
            organization: { type: "string" },
            location: { type: "string" },
            impact_description: { type: "string" },
            personal_motivation: { type: "string" },
            call_to_action: { type: "string" }
          }
        }
      });

      // Generate flyer image
      const flyerPrompt = `Create an elegant, professional social impact flyer for a dark theme featuring a character-driven story.

Story Title: "${storyResult.title}"
Character: ${storyResult.character_name || 'Main Character'}
Social Issue: ${parsedData.community_issue}
Key Message: "${storyResult.key_message}"

Design aesthetic: Dark, sophisticated background (charcoal or deep navy) with glowing purple and indigo accents. The design should be emotionally evocative and story-focused, with elegant typography. Include subtle illustrations or imagery that reflects the social issue. The overall mood should be hopeful yet serious, inspiring action.`;

      const flyerResult = await GenerateImage({ prompt: flyerPrompt });

      // Save to database
      const storyData = {
        title: storyResult.title,
        storyteller_name: parsedData.storyteller_name || "Anonymous Storyteller",
        community_issue: parsedData.community_issue,
        organization: parsedData.organization,
        location: parsedData.location,
        impact_description: parsedData.impact_description,
        personal_motivation: parsedData.personal_motivation,
        call_to_action: storyResult.call_to_action,
        raw_responses: allResponses,
        generated_story: storyResult.story_text,
        flyer_url: flyerResult.url,
        status: "completed"
      };

      const savedStory = await Story.create(storyData);
      setSavedStoryId(savedStory.id);
      setGeneratedStory({ ...storyResult, flyer_url: flyerResult.url });

      await simulateTyping("Your powerful story has been created! You can now view, download, and share it to help raise awareness about this important issue.");
      
    } catch (error) {
      console.error("Error generating story:", error);
      await simulateTyping("I apologize, but there was an error creating your story. Please try again or contact support.");
    }
    
    setIsGenerating(false);
  };

  const downloadTxt = () => {
    if (!generatedStory) return;
    const content = `${generatedStory.title}\n\n${generatedStory.story_text}\n\nKey Message: ${generatedStory.key_message}\n\nCall to Action: ${generatedStory.call_to_action}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedStory.title.replace(/\s+/g, '-')}-story.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadFlyer = () => {
    if (generatedStory?.flyer_url) {
      const link = document.createElement('a');
      link.href = generatedStory.flyer_url;
      link.download = `${generatedStory.title}-flyer.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-cyan-500/10 to-purple-600/10 blur-3xl"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-cyan-500 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-cyan-400/30 to-purple-400/30 animate-pulse rounded-3xl"></div>
                  <Sparkles className="w-10 h-10 text-white z-10" />
                  <Zap className="w-6 h-6 text-cyan-300 absolute top-2 right-2 animate-pulse" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-3xl blur-lg animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400">
                Create Your
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400">
                Own Stories
              </span>
            </h1>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
              Transform your experiences into compelling narratives with our AI-powered storytelling platform
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-2xl shadow-2xl border border-purple-500/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-cyan-500/5 to-purple-600/5"></div>
          <div className="relative">
            <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] flex items-start gap-4 ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center relative overflow-hidden ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-br from-purple-600 to-purple-700' 
                          : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        {message.type === 'user' ? (
                          <User className="w-5 h-5 text-white z-10" />
                        ) : (
                          <Bot className="w-5 h-5 text-white z-10" />
                        )}
                      </div>
                      <div className={`px-6 py-4 rounded-3xl shadow-lg border backdrop-blur-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-purple-600/90 to-purple-700/90 text-white border-purple-500/50'
                          : 'bg-gradient-to-br from-slate-700/90 to-slate-800/90 border-slate-600/50 text-slate-200'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <Bot className="w-5 h-5 text-white z-10" />
                    </div>
                    <div className="px-6 py-4 rounded-3xl bg-gradient-to-br from-slate-700/90 to-slate-800/90 border border-slate-600/50 backdrop-blur-sm">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/40 rounded-3xl px-8 py-5 flex items-center gap-4 backdrop-blur-sm">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-semibold text-lg">
                      Crafting your story with AI magic...
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {!isGenerating && !generatedStory && (
              <div className="border-t border-purple-500/30 p-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                <div className="flex gap-4">
                  <Textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Share your thoughts here..."
                    className="flex-1 resize-none bg-slate-800/80 border-slate-600/50 text-slate-200 placeholder-slate-500 focus:border-purple-500/70 focus:ring-purple-500/50 rounded-2xl backdrop-blur-sm"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitResponse();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={!currentInput.trim() || isTyping}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 px-8 py-3 rounded-2xl shadow-lg border-0 transition-all duration-300 purple-glow"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {generatedStory && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-12 space-y-8"
          >
            <Card className="bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-2xl shadow-2xl border border-purple-500/30 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-cyan-500/5 to-purple-600/5"></div>
              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      Your AI-Generated Story
                    </h2>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={downloadTxt} 
                      variant="outline" 
                      className="gap-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 bg-slate-800/50 backdrop-blur-sm rounded-2xl px-6 py-3"
                    >
                      <File className="w-4 h-4" />
                      Download TXT
                    </Button>
                     <Button
                      onClick={downloadFlyer}
                      disabled={!generatedStory.flyer_url}
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 gap-2 rounded-2xl px-6 py-3 shadow-lg purple-glow"
                    >
                      <Download className="w-4 h-4" />
                      Download Flyer
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-100 mb-4">
                      {generatedStory.title}
                    </h3>
                    <div className="prose prose-invert prose-lg max-w-none">
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
                        {generatedStory.story_text}
                      </p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8 pt-8 border-t border-purple-500/20">
                    <div className="p-6 bg-gradient-to-br from-purple-600/10 to-transparent rounded-2xl border border-purple-500/20">
                      <h4 className="font-semibold text-purple-300 mb-3 text-lg">Key Message</h4>
                      <p className="text-slate-400 leading-relaxed">{generatedStory.key_message}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-cyan-600/10 to-transparent rounded-2xl border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-300 mb-3 text-lg">Call to Action</h4>
                      <p className="text-slate-400 leading-relaxed">{generatedStory.call_to_action}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {generatedStory.flyer_url && (
              <Card className="bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 backdrop-blur-2xl shadow-2xl border border-purple-500/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-cyan-500/5 to-purple-600/5"></div>
                <div className="relative p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-purple-400" />
                      <h2 className="text-2xl font-bold text-slate-100">Generated Story Flyer</h2>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 rounded-lg p-4">
                    <img
                      src={generatedStory.flyer_url}
                      alt="Generated Impact Story Flyer"
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                </div>
              </Card>
            )}

            <div className="text-center">
              <Alert className="bg-emerald-500/10 border-emerald-500/30">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <AlertDescription className="text-emerald-300">
                  Your character-driven story has been saved! Share it to help raise awareness about this important social issue.
                </AlertDescription>
              </Alert>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}