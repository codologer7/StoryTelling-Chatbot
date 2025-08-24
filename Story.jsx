import React, { useState, useEffect } from "react";
import { Story } from "@/entities/Story";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  MapPin, 
  Users, 
  Building2,
  Calendar,
  Target,
  Heart,
  Lightbulb,
  TrendingUp,
  MessageCircle,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function StoryPage() {
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storyId = urlParams.get('id');
    
    if (storyId) {
      loadStory(storyId);
    } else {
      setError("No story ID provided");
      setIsLoading(false);
    }
  }, []);

  const loadStory = async (storyId) => {
    setIsLoading(true);
    try {
      const stories = await Story.list();
      const foundStory = stories.find(s => s.id === storyId);
      
      if (foundStory) {
        setStory(foundStory);
      } else {
        setError("Story not found");
      }
    } catch (error) {
      console.error("Error loading story:", error);
      setError("Failed to load story");
    }
    setIsLoading(false);
  };

  const downloadStoryTxt = () => {
    if (!story) return;
    const content = `Title: ${story.title}\n\n---\n\n${story.generated_story}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.title.replace(/\s+/g, '-')}-story.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadFlyer = () => {
    if (story?.flyer_url) {
      const link = document.createElement('a');
      link.href = story.flyer_url;
      link.download = `${story.title}-flyer.png`;
      link.click();
    }
  };

  const shareStory = async () => {
    if (navigator.share && story) {
      try {
        await navigator.share({
          title: story.title,
          text: `Check out this inspiring impact story: ${story.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        alert("Story URL copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Story URL copied to clipboard!");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      in_progress: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
      completed: "bg-green-400/10 text-green-300 border-green-400/20", 
      published: "bg-purple-400/10 text-purple-300 border-purple-400/20"
    };
    return colors[status] || colors.completed;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="h-64 bg-slate-800 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-6 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Story Not Found</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link to={createPageUrl("Stories")}>
            <Button className="bg-purple-600 hover:bg-purple-700 purple-glow">Back to Stories</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Stories")}>
                <Button variant="outline" size="icon" className="rounded-full bg-slate-800/50 border-slate-700 hover:bg-slate-700/50">
                  <ArrowLeft className="w-4 h-4 text-slate-300" />
                </Button>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(story?.status)} border text-sm font-medium`}>
                    {story?.status?.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-slate-400">
                    Created {story?.created_date && format(new Date(story.created_date), "MMMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={shareStory}
                className="gap-2 flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 bg-slate-800/50 backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={downloadStoryTxt}
                className="gap-2 flex-1 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 bg-slate-800/50 backdrop-blur-sm"
              >
                <FileText className="w-4 h-4" />
                Download Story
              </Button>
              {story?.flyer_url && (
                <Button
                  onClick={downloadFlyer}
                  className="bg-purple-600 hover:bg-purple-700 gap-2 flex-1 purple-glow"
                >
                  <Download className="w-4 h-4" />
                  Flyer
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Story Header */}
          <Card className="bg-slate-800/30 backdrop-blur-xl shadow-2xl border border-purple-500/20">
            <CardHeader className="pb-8 p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-100 leading-tight">
                {story?.title}
              </h1>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {story?.storyteller_name && (
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                    <Users className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Storyteller</p>
                      <p className="font-medium text-slate-200">{story.storyteller_name}</p>
                    </div>
                  </div>
                )}

                {story?.organization && (
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Organization</p>
                      <p className="font-medium text-slate-200">{story.organization}</p>
                    </div>
                  </div>
                )}

                {story?.location && (
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Location</p>
                      <p className="font-medium text-slate-200">{story.location}</p>
                    </div>
                  </div>
                )}

                {story?.beneficiaries_count && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <Heart className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs text-emerald-500 uppercase tracking-wide font-medium">Impact</p>
                      <p className="font-bold text-emerald-300">{story.beneficiaries_count} people</p>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Generated Story */}
          {story?.generated_story && (
            <Card className="bg-slate-800/30 backdrop-blur-xl shadow-2xl border border-purple-500/20">
              <CardHeader>
                <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                  Impact Story
                </h2>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {story.generated_story}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Story Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {story?.community_issue && (
              <Card className="bg-slate-800/30 backdrop-blur-xl shadow-lg border border-slate-700/50">
                <CardHeader>
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-400" />
                    Community Issue
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{story.community_issue}</p>
                </CardContent>
              </Card>
            )}

            {story?.impact_description && (
              <Card className="bg-slate-800/30 backdrop-blur-xl shadow-lg border border-slate-700/50">
                <CardHeader>
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Impact Made
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{story.impact_description}</p>
                </CardContent>
              </Card>
            )}

            {story?.challenges_faced && (
              <Card className="bg-slate-800/30 backdrop-blur-xl shadow-lg border border-slate-700/50">
                <CardHeader>
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-orange-400" />
                    Challenges & Solutions
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-1">Challenges:</p>
                      <p className="text-slate-300">{story.challenges_faced}</p>
                    </div>
                    {story.solutions_implemented && (
                      <div>
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-1">Solutions:</p>
                        <p className="text-slate-300">{story.solutions_implemented}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {story?.measurable_outcomes && (
              <Card className="bg-slate-800/30 backdrop-blur-xl shadow-lg border border-slate-700/50">
                <CardHeader>
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Measurable Outcomes
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{story.measurable_outcomes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Details */}
          <div className="grid md:grid-cols-2 gap-6">
            {story?.personal_motivation && (
              <Card className="bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/20 shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-400" />
                    Personal Motivation
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{story.personal_motivation}</p>
                </CardContent>
              </Card>
            )}

            {story?.future_goals && (
              <Card className="bg-gradient-to-br from-cyan-600/10 to-transparent border border-cyan-500/20 shadow-lg">
                <CardHeader>
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    Future Goals
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{story.future_goals}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Call to Action */}
          {story?.call_to_action && (
            <Card className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-xl border-0">
              <CardHeader>
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <MessageCircle className="w-6 h-6" />
                  How You Can Help
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed">{story.call_to_action}</p>
              </CardContent>
            </Card>
          )}

          {/* Flyer Preview */}
          {story?.flyer_url && (
            <Card className="bg-slate-800/30 backdrop-blur-xl shadow-2xl border border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-200">Impact Flyer</h3>
                  <Button
                    onClick={downloadFlyer}
                    className="bg-purple-600 hover:bg-purple-700 gap-2 purple-glow"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4">
                  <img
                    src={story.flyer_url}
                    alt={`${story.title} - Impact Flyer`}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}