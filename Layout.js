import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Story } from "@/entities/Story";
import { MessageSquare, BookOpen, Plus, MessageCircle, Users, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "New Interview",
    url: createPageUrl("Interview"),
    icon: Plus,
  },
  {
    title: "Stories Archive",
    url: createPageUrl("Stories"),
    icon: BookOpen,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [storyStats, setStoryStats] = useState({ total: 0, inProgress: 0 });

  useEffect(() => {
    const fetchStoryStats = async () => {
      try {
        const allStories = await Story.list();
        const total = allStories.length;
        const inProgress = allStories.filter(s => s.status === 'in_progress').length;
        setStoryStats({ total, inProgress });
      } catch (error) {
        console.error("Failed to load story stats:", error);
      }
    };

    fetchStoryStats();
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-200">
        <style>{`
          :root {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
            --card: 222.2 84% 4.9%;
            --card-foreground: 210 40% 98%;
            --popover: 222.2 84% 4.9%;
            --popover-foreground: 210 40% 98%;
            --primary: 262.1 83.3% 57.8%;
            --primary-foreground: 210 40% 98%;
            --secondary: 217.2 32.6% 17.5%;
            --secondary-foreground: 210 40% 98%;
            --muted: 217.2 32.6% 17.5%;
            --muted-foreground: 215 20.2% 65.1%;
            --accent: 217.2 32.6% 17.5%;
            --accent-foreground: 210 40% 98%;
            --destructive: 0 62.8% 30.6%;
            --destructive-foreground: 210 40% 98%;
            --border: 217.2 32.6% 17.5%;
            --input: 217.2 32.6% 17.5%;
            --ring: 262.1 83.3% 57.8%;
          }
          .purple-glow {
            box-shadow: 0 0 20px 8px rgba(168, 85, 247, 0.25), 0 0 8px 2px rgba(168, 85, 247, 0.2);
          }
          .cyan-glow {
            box-shadow: 0 0 15px 5px rgba(6, 182, 212, 0.2), 0 0 5px 1px rgba(6, 182, 212, 0.15);
          }
          .sidebar-dark {
            background: linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(15, 23, 42, 0.95) 100%);
            backdrop-filter: blur(20px);
            border-right: 1px solid rgba(168, 85, 247, 0.2);
          }
          .futuristic-border {
            border: 1px solid;
            border-image: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(6, 182, 212, 0.3), rgba(168, 85, 247, 0.3)) 1;
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}</style>
        <Sidebar className="border-r border-purple-500/20 backdrop-blur-xl sidebar-dark">
          <SidebarHeader className="border-b border-purple-500/20 p-6 sidebar-dark">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-cyan-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-cyan-400/20 to-purple-400/20 animate-pulse"></div>
                <div className="relative flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white z-10" />
                  <Zap className="w-4 h-4 text-cyan-300 absolute top-0 right-0 animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 text-xl tracking-wide">
                  Samvad AI
                </h2>
                <p className="text-xs text-slate-400 font-medium tracking-wider">AI-Powered Storytelling</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 sidebar-dark">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Create & Manage
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-purple-600/20 hover:text-purple-300 transition-all duration-200 rounded-xl py-3 px-4 ${
                          location.pathname === item.url ? 'bg-purple-600/20 text-purple-300' : 'text-slate-300'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 mr-1" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-cyan-400/80 uppercase tracking-widest px-3 py-3">
                Impact Dashboard
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-4 space-y-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl mx-2 border border-purple-500/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-all duration-300">
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-sm text-slate-300 font-medium">Stories Created</span>
                    </div>
                    <div className="bg-emerald-500/20 px-3 py-2 rounded-xl border border-emerald-500/30">
                      <span className="font-bold text-emerald-400 text-lg">
                        {storyStats.total}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-all duration-300">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-sm text-slate-300 font-medium">In Progress</span>
                    </div>
                    <div className="bg-purple-500/20 px-3 py-2 rounded-xl border border-purple-500/30">
                      <span className="font-bold text-purple-400 text-lg">
                        {storyStats.inProgress}
                      </span>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-slate-900/70 backdrop-blur-xl border-b border-purple-500/20 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-800/50 p-3 rounded-2xl transition-all duration-300 text-slate-300 border border-purple-500/20" />
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                Samvad AI
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}