"use client";

import React, { useState } from 'react';
import { Search, BookOpen, Video, MessageCircle, HelpCircle, FileText, Zap, Users, Settings, Package, Calendar, BarChart3, ChevronRight, Download, ExternalLink, Play, Check, ArrowRight, Clock, Cpu } from 'lucide-react';

// Types
type Article = {
  id: string;
  title: string;
  category: string;
  summary: string;
  readTime: number;
  tags: string[];
};

type VideoTutorial = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'guide' | 'videos' | 'faq' | 'support'>('guide');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sample Data
  const articles: Article[] = [
    {
      id: 'art1',
      title: 'Getting Started with AI Production Planning',
      category: 'Getting Started',
      summary: 'Learn the basics of setting up your production planning system and creating your first plan.',
      readTime: 5,
      tags: ['basics', 'setup', 'planning']
    },
    {
      id: 'art2',
      title: 'Master Data Management Best Practices',
      category: 'Master Data',
      summary: 'Essential guidelines for managing products, BOMs, routings, machines, and personnel data.',
      readTime: 8,
      tags: ['master data', 'best practices', 'setup']
    },
    {
      id: 'art3',
      title: 'Using the AI Planning Engine',
      category: 'Planning',
      summary: 'Deep dive into AI-powered scheduling, optimization objectives, and constraint management.',
      readTime: 12,
      tags: ['AI', 'planning', 'optimization']
    },
    {
      id: 'art4',
      title: 'Manual Planning with Drag & Drop',
      category: 'Planning',
      summary: 'Learn how to manually adjust schedules using the interactive Gantt chart planner board.',
      readTime: 6,
      tags: ['manual', 'gantt', 'scheduling']
    },
    {
      id: 'art5',
      title: 'Setting Up Work Centers and Machines',
      category: 'Master Data',
      summary: 'Configure your production floor layout, work centers, machines, and capacity settings.',
      readTime: 7,
      tags: ['work centers', 'machines', 'capacity']
    },
    {
      id: 'art6',
      title: 'Managing Tools and Molds',
      category: 'Master Data',
      summary: 'Track tool life cycles, maintenance schedules, and compatibility with machines and processes.',
      readTime: 10,
      tags: ['tools', 'molds', 'maintenance']
    },
    {
      id: 'art7',
      title: 'Personnel and Skills Management',
      category: 'Master Data',
      summary: 'Set up employee profiles, skill levels, shift patterns, and resource assignments.',
      readTime: 8,
      tags: ['personnel', 'skills', 'shifts']
    },
    {
      id: 'art8',
      title: 'Maintenance Planning Integration',
      category: 'Maintenance',
      summary: 'Schedule preventive maintenance, track equipment status, and avoid production conflicts.',
      readTime: 9,
      tags: ['maintenance', 'PM', 'equipment']
    },
    {
      id: 'art9',
      title: 'Inventory and Material Management',
      category: 'Inventory',
      summary: 'Monitor stock levels, track material availability, and integrate with planning constraints.',
      readTime: 7,
      tags: ['inventory', 'materials', 'stock']
    },
    {
      id: 'art10',
      title: 'Reports and Analytics',
      category: 'Reports',
      summary: 'Generate KPI reports, analyze performance metrics, and export data for further analysis.',
      readTime: 6,
      tags: ['reports', 'analytics', 'KPI']
    },
    {
      id: 'art11',
      title: 'EMS Integration Setup',
      category: 'Integrations',
      summary: 'Connect your EMS system for real-time machine status and automatic production tracking.',
      readTime: 15,
      tags: ['EMS', 'integration', 'real-time']
    },
    {
      id: 'art12',
      title: 'User Roles and Permissions',
      category: 'Administration',
      summary: 'Configure RBAC, manage user access, and set up approval workflows.',
      readTime: 8,
      tags: ['security', 'RBAC', 'permissions']
    },
  ];

  const videos: VideoTutorial[] = [
    { id: 'vid1', title: 'Quick Start Guide (5 minutes)', duration: '5:23', thumbnail: '🎬', category: 'Getting Started' },
    { id: 'vid2', title: 'Creating Your First Production Plan', duration: '8:45', thumbnail: '📊', category: 'Planning' },
    { id: 'vid3', title: 'Master Data Setup Walkthrough', duration: '12:30', thumbnail: '📋', category: 'Master Data' },
    { id: 'vid4', title: 'Advanced Planning Techniques', duration: '15:20', thumbnail: '🧠', category: 'Planning' },
    { id: 'vid5', title: 'Gantt Board Deep Dive', duration: '10:15', thumbnail: '📈', category: 'Planning' },
    { id: 'vid6', title: 'EMS Integration Tutorial', duration: '18:40', thumbnail: '🔗', category: 'Integrations' },
  ];

  const faqs: FAQ[] = [
    {
      id: 'faq1',
      question: 'How does the AI planning engine work?',
      answer: 'The AI planning engine uses a combination of genetic algorithms and constraint programming to find optimal production schedules. It considers multiple objectives (on-time delivery, utilization, changeovers) and constraints (machine capacity, skills, maintenance windows, tool availability) to generate feasible plans. The engine runs multiple iterations to improve the solution quality.',
      category: 'Planning'
    },
    {
      id: 'faq2',
      question: 'Can I manually adjust AI-generated plans?',
      answer: 'Yes! After the AI generates a plan, you can use the drag-and-drop Gantt board to manually adjust job assignments, timings, and sequences. The system will validate your changes and warn you of any conflicts (overlaps, skill mismatches, maintenance windows).',
      category: 'Planning'
    },
    {
      id: 'faq3',
      question: 'How do I import existing master data?',
      answer: 'Navigate to each master data section (Products, Machines, Personnel, etc.) and click the "Import" button. Download our CSV template, fill in your data, and upload it back. The system validates the data and shows any errors before importing.',
      category: 'Master Data'
    },
    {
      id: 'faq4',
      question: 'What is the difference between Work Centers and Machines?',
      answer: 'Work Centers are logical groupings of similar machines or production areas (e.g., "CNC Machining", "Assembly"). Machines are individual pieces of equipment within a Work Center. When planning, you can route operations to a Work Center, and the system will assign specific Machines based on availability.',
      category: 'Master Data'
    },
    {
      id: 'faq5',
      question: 'How does tool life tracking work?',
      answer: 'Each tool has a maximum usage cycle count. Every time a tool is used in production, the system tracks cycles consumed. When remaining life drops below thresholds (e.g., 20%), alerts are triggered. Maintenance resets the cycle count based on whether the tool was sharpened, repaired, or replaced.',
      category: 'Tools & Maintenance'
    },
    {
      id: 'faq6',
      question: 'Can the system handle preventive maintenance schedules?',
      answer: 'Yes. Define PM plans with frequencies (daily, weekly, monthly, by hours/cycles) and the system automatically blocks machine availability during maintenance windows. The planner avoids scheduling jobs during these periods.',
      category: 'Tools & Maintenance'
    },
    {
      id: 'faq7',
      question: 'How do I integrate with my EMS/ERP system?',
      answer: 'Go to Settings > Integrations and enable the EMS or ERP connector. Enter your API endpoint and authentication key. Configure sync intervals and field mappings. The system will poll for machine status (EMS) or sync orders/inventory (ERP) automatically.',
      category: 'Integrations'
    },
    {
      id: 'faq8',
      question: 'What permissions do Planners vs Supervisors have?',
      answer: 'Planners can create/edit plans, run AI optimization, and manually adjust schedules. Supervisors can approve plans, view reports, and override decisions. Operators see only their assigned tasks. Admins manage all master data, users, and system settings. Full RBAC matrix is in the User Management documentation.',
      category: 'Administration'
    },
    {
      id: 'faq9',
      question: 'Can I compare multiple planning scenarios?',
      answer: 'Yes! Save different planning scenarios (Plan A, B, C) and use the Scenario Compare view to see side-by-side KPIs (makespan, tardiness, utilization) and Gantt thumbnails. This helps evaluate what-if scenarios before committing to production.',
      category: 'Planning'
    },
    {
      id: 'faq10',
      question: 'How do I handle rush orders or priority changes?',
      answer: 'Mark an order as "High Priority" or "Critical" in Order Management. Run the AI planner again, and it will re-optimize considering the new priorities. You can also manually drag the rush order to an earlier slot on the Gantt board.',
      category: 'Planning'
    },
    {
      id: 'faq11',
      question: 'What reports are available?',
      answer: 'Standard reports include: On-time Delivery %, Machine Utilization, Bottleneck Analysis, Plan Adherence, OEE (with EMS), Late Orders, Changeover Time, Lead Time, and Maintenance Impact. All reports can be exported to CSV, Excel, or PDF.',
      category: 'Reports'
    },
    {
      id: 'faq12',
      question: 'How does inventory checking work in planning?',
      answer: 'If enabled in Settings, the planner checks BOM material availability against current inventory before scheduling jobs. Jobs lacking materials are flagged, and you can choose to delay them or proceed with procurement assumptions.',
      category: 'Inventory'
    },
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'Getting Started', name: 'Getting Started', icon: Zap },
    { id: 'Planning', name: 'Planning', icon: Calendar },
    { id: 'Master Data', name: 'Master Data', icon: Package },
    { id: 'Tools & Maintenance', name: 'Tools & Maintenance', icon: Settings },
    { id: 'Inventory', name: 'Inventory', icon: Package },
    { id: 'Reports', name: 'Reports', icon: BarChart3 },
    { id: 'Integrations', name: 'Integrations', icon: Settings },
    { id: 'Administration', name: 'Administration', icon: Users },
  ];

  // Filter content
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <HelpCircle className="w-16 h-16" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Help & Documentation</h1>
            <p className="text-xl text-blue-100 mb-8">Everything you need to master AI Production Planning</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search documentation, tutorials, and FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 text-lg text-gray-900 rounded-lg focus:ring-4 focus:ring-blue-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Start</h3>
            <p className="text-sm text-gray-600">Get up and running in 5 minutes</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
            <p className="text-sm text-gray-600">Learn with step-by-step videos</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
            <p className="text-sm text-gray-600">Get help from our team</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Downloads</h3>
            <p className="text-sm text-gray-600">Templates and resources</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
              <nav className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Support Box */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">Our support team is ready to assist you</p>
              <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'guide', name: 'User Guide', icon: BookOpen, count: filteredArticles.length },
                  { id: 'videos', name: 'Video Tutorials', icon: Video, count: filteredVideos.length },
                  { id: 'faq', name: 'FAQ', icon: HelpCircle, count: filteredFAQs.length },
                  { id: 'support', name: 'Support', icon: MessageCircle, count: 0 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'guide' | 'videos' | 'faq' | 'support')}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                      {tab.count > 0 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {/* User Guide Tab */}
                {activeTab === 'guide' && (
                  <div className="space-y-4">
                    {filteredArticles.length > 0 ? (
                      filteredArticles.map((article) => (
                        <div
                          key={article.id}
                          className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                              </div>
                              <p className="text-gray-600 mb-3">{article.summary}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {article.readTime} min read
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  {article.category}
                                </span>
                                <div className="flex gap-1">
                                  {article.tags.map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No articles found matching your search</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Video Tutorials Tab */}
                {activeTab === 'videos' && (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredVideos.length > 0 ? (
                      filteredVideos.map((video) => (
                        <div
                          key={video.id}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-40 flex items-center justify-center text-6xl">
                            {video.thumbnail}
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 flex-1">{video.title}</h3>
                              <Play className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{video.duration}</span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                {video.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 text-gray-500">
                        <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No videos found matching your search</p>
                      </div>
                    )}
                  </div>
                )}

                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                  <div className="space-y-3">
                    {filteredFAQs.length > 0 ? (
                      filteredFAQs.map((faq) => (
                        <div
                          key={faq.id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                            className="w-full flex items-start justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                                <span className="text-xs text-gray-500 mt-1 inline-block">
                                  {faq.category}
                                </span>
                              </div>
                            </div>
                            <ChevronRight
                              className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-2 transition-transform ${
                                expandedFAQ === faq.id ? 'rotate-90' : ''
                              }`}
                            />
                          </button>
                          {expandedFAQ === faq.id && (
                            <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No FAQs found matching your search</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Support Tab */}
                {activeTab === 'support' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch</h2>
                      <p className="text-gray-600 mb-6">Our support team is here to help you succeed</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                          <MessageCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                        <p className="text-sm text-gray-600 mb-4">Get help via email within 24 hours</p>
                        <a
                          href="mailto:support@claude.ai"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          support@claude.ai
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Community Forum</h3>
                        <p className="text-sm text-gray-600 mb-4">Connect with other users</p>
                        <a
                          href="#"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          Visit Forum
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">API Documentation</h3>
                        <p className="text-sm text-gray-600 mb-4">Technical docs for developers</p>
                        <a
                          href="https://docs.claude.com"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          docs.claude.com
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                          <Download className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Resources</h3>
                        <p className="text-sm text-gray-600 mb-4">Templates and guides</p>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                          Download All
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Contact Form */}
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <h3 className="font-semibold text-gray-900 mb-4">Send us a message</h3>
                      <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="your.email@company.com"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="How can we help?"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                          <textarea
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe your issue or question..."
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                        >
                          Send Message
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Quick Start Guide</h2>
            <p className="text-blue-100">Get your production planning system up and running in 5 simple steps</p>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {[
              { step: 1, title: 'Setup Master Data', description: 'Configure products, machines, work centers', icon: Package },
              { step: 2, title: 'Define Routings', description: 'Create process flows and BOMs', icon: ArrowRight },
              { step: 3, title: 'Import Orders', description: 'Add customer orders to plan', icon: FileText },
              { step: 4, title: 'Run AI Planning', description: 'Generate optimized schedule', icon: Cpu },
              { step: 5, title: 'Execute & Monitor', description: 'Dispatch jobs and track progress', icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                    {item.step}
                  </div>
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-blue-100">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium inline-flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch 5-Minute Setup Video
            </button>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Downloadable Resources</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              title: 'CSV Import Templates',
              description: 'Pre-formatted templates for all master data',
              icon: FileText,
              color: 'blue',
              items: ['Products', 'BOMs', 'Routings', 'Machines', 'Personnel']
            },
            {
              title: 'User Guides (PDF)',
              description: 'Comprehensive documentation for all features',
              icon: BookOpen,
              color: 'green',
              items: ['Planning Guide', 'Master Data Guide', 'Admin Guide', 'API Reference']
            },
            {
              title: 'Best Practices',
              description: 'Industry-proven optimization strategies',
              icon: Check,
              color: 'purple',
              items: ['Setup Checklist', 'Optimization Tips', 'Common Pitfalls', 'Case Studies']
            },
          ].map((resource) => {
            const Icon = resource.icon;
            return (
              <div key={resource.title} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 bg-${resource.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${resource.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                <ul className="space-y-2 mb-4">
                  {resource.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button className={`w-full px-4 py-2 bg-${resource.color}-600 text-white rounded-lg hover:bg-${resource.color}-700 flex items-center justify-center gap-2`}>
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular Topics */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Topics</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'How to optimize for on-time delivery', views: '1.2K', category: 'Planning' },
              { title: 'Setting up skill-based job assignments', views: '890', category: 'Personnel' },
              { title: 'Integrating with your ERP system', views: '756', category: 'Integrations' },
              { title: 'Understanding constraint validation', views: '634', category: 'Planning' },
              { title: 'Managing tool life and maintenance', views: '512', category: 'Tools' },
              { title: 'Creating custom reports and dashboards', views: '445', category: 'Reports' },
            ].map((topic, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{topic.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">{topic.category}</span>
                      <span>• {topic.views} views</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Keyboard Shortcuts</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">General</h3>
              <div className="space-y-3">
                {[
                  { keys: ['Ctrl', 'S'], action: 'Save current scenario' },
                  { keys: ['Ctrl', 'Z'], action: 'Undo last action' },
                  { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo action' },
                  { keys: ['/', '?'], action: 'Open search' },
                ].map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{shortcut.action}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-gray-400">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Planner Board</h3>
              <div className="space-y-3">
                {[
                  { keys: ['Z'], action: 'Zoom in timeline' },
                  { keys: ['X'], action: 'Zoom out timeline' },
                  { keys: ['Space'], action: 'Pan/drag mode' },
                  { keys: ['Del'], action: 'Delete selected job' },
                ].map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{shortcut.action}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <kbd key={keyIdx} className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Requirements */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Requirements</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Browser Support</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Chrome 90+ (Recommended)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Firefox 88+
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Safari 14+
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Edge 90+
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recommended Specs</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  4GB RAM minimum
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  1920x1080 resolution
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Broadband internet
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  JavaScript enabled
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Security</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  SSL/TLS encryption
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  SSO/OIDC support
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Role-based access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Audit logging
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-xl text-blue-100 mb-8">Our support team is ready to help you succeed</p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium inline-flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </button>
            <button className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium inline-flex items-center gap-2">
              <Video className="w-5 h-5" />
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;