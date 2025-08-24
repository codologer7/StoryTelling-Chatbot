import React, { useState, useEffect } from "react";
import { Story } from "@/entities/Story";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  Download,
  MapPin,
  Users,
  Heart,
  Calendar,
  Building2,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    filterStories();
  }, [stories, searchTerm, selectedStatus]);

  const loadStories = async () => {
    setIsLoading(true);
    try {
      const data = await Story.list("-created_date");
      setStories(data);
    } catch (error) {
      console.error("Error loading stories:", error);
    }
    setIsLoading(false);
  };

  const filterStories = () => {
    let filtered = stories;

    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.community_issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.storyteller_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(story => story.status === selectedStatus);
    }

    setFilteredStories(filtered);
  };

  const downloadFlyer = (flyerUrl, title) => {
    if (flyerUrl) {
      const link = document.createElement('a');
      link.href = flyerUrl;
      link.download = `${title}-flyer.png`;
      link.click();
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
      <div className="min-h-screen bg-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-800 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">
                Impact Stories Archive
              </h1>
              <p className="text-slate-400">
                Browse and manage all your community impact stories
              </p>
            </div>
            <Link to={createPageUrl("Interview")}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-lg purple-glow">
                <Sparkles className="w-4 h-4" />
                Create New Story
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              <Input
                placeholder="Search stories, organizations, or issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {filteredStories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">
              {searchTerm || selectedStatus !== "all" ? "No stories found" : "No stories yet"}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your search criteria"
                : "Start creating impactful stories to share with your community"
              }
            </p>
            <Link to={createPageUrl("Interview")}>
              <Button className="bg-purple-600 hover:bg-purple-700 purple-glow">
                Create Your First Story
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 border border-slate-700 group overflow-hidden h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={`${getStatusColor(story.status)} border text-xs font-medium`}>
                        {story.status?.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {format(new Date(story.created_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-200 line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {story.title || "Untitled Story"}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3 flex-1">
                      {story.storyteller_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 font-medium">{story.storyteller_name}</span>
                        </div>
                      )}

                      {story.organization && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-400">{story.organization}</span>
                        </div>
                      )}

                      {story.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-400">{story.location}</span>
                        </div>
                      )}

                      {story.community_issue && (
                        <p className="text-sm text-slate-400 line-clamp-2">
                          <span className="font-medium text-slate-300">Issue:</span> {story.community_issue}
                        </p>
                      )}

                      {story.beneficiaries_count && (
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full w-fit">
                          <Heart className="w-3 h-3" />
                          {story.beneficiaries_count} people impacted
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-700">
                      <Link to={createPageUrl(`Story?id=${story.id}`)} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-slate-600 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-300 transition-all"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      {story.flyer_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFlyer(story.flyer_url, story.title)}
                          className="border-slate-600 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-300 transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}