"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  BookOpen,
  Download,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Search,
  Eye,
  FileCheck,
  Package,
  Archive,
  FileCode,
  File,
  Menu,
  X,
  FolderOpen,
  PlayCircle,
  Clock,
} from "lucide-react";
import { formatDocumentForDisplay, type ParsedDocument } from "@/lib/document-parser";
import { BackButton } from "@/components/navigation/back-button";
import Image from "next/image";

// Mock course data for offline portal - Unique courses different from online
const offlineCourses = [
  {
    id: "1",
    title: "Digital Marketing Fundamentals",
    description: "Master digital marketing strategies with downloadable guides and practice materials",
    category: "Business",
    cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    modules: [
      {
        id: "1.1",
        title: "Module 1: Social Media Marketing",
        description: "Learn how to create effective social media campaigns",
        duration: "2 hours",
        subtopics: [
          {
            id: "1.1.1",
            title: "Social Media Strategy Guide",
            type: "practice",
            downloadable: true,
            files: [
              { name: "Social_Media_Strategy.pdf", type: "pdf", size: "3.2 MB" },
              { name: "Content_Calendar_Template.xlsx", type: "xlsx", size: "1.5 MB" },
              { name: "Hashtag_Research_Guide.pdf", type: "pdf", size: "2.1 MB" },
            ],
          },
          {
            id: "1.1.2",
            title: "Facebook & Instagram Marketing",
            type: "practice",
            downloadable: true,
            files: [
              { name: "FB_IG_Marketing_Guide.pdf", type: "pdf", size: "4.5 MB" },
              { name: "Ad_Creative_Templates.zip", type: "zip", size: "6.8 MB" },
            ],
          },
        ],
      },
      {
        id: "1.2",
        title: "Module 2: SEO & Content Marketing",
        description: "Master SEO techniques and content creation strategies",
        duration: "3 hours",
        subtopics: [
          {
            id: "1.2.1",
            title: "SEO Best Practices Handbook",
            type: "practice",
            downloadable: true,
            files: [
              { name: "SEO_Handbook.pdf", type: "pdf", size: "5.2 MB" },
              { name: "Keyword_Research_Tools.zip", type: "zip", size: "3.4 MB" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Graphic Design Essentials",
    description: "Learn design principles with downloadable templates and practice projects",
    category: "Creative",
    cover: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    modules: [
      {
        id: "2.1",
        title: "Module 1: Design Principles",
        description: "Understanding color theory and typography",
        duration: "2.5 hours",
        subtopics: [
          {
            id: "2.1.1",
            title: "Color Theory & Typography Guide",
            type: "practice",
            downloadable: true,
            files: [
              { name: "Color_Theory_Guide.pdf", type: "pdf", size: "4.8 MB" },
              { name: "Typography_Reference.pdf", type: "pdf", size: "3.6 MB" },
              { name: "Design_Templates.zip", type: "zip", size: "12.5 MB" },
            ],
          },
        ],
      },
    ],
  },
];

// Get downloaded content from localStorage
const getDownloadedContent = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("offline_downloaded_content");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save downloaded content
const saveDownloadedContent = (content: any) => {
  if (typeof window === "undefined") return;
  const existing = getDownloadedContent();
  const updated = [...existing, content];
  localStorage.setItem("offline_downloaded_content", JSON.stringify(updated));
};

export default function OfflineCoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(
    searchParams.get("course") || null
  );
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedContents, setExpandedContents] = useState<Set<string>>(new Set()); // Track expanded content sections
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set()); // Track expanded file content
  const [downloadedContent, setDownloadedContent] = useState(getDownloadedContent());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-select first module when course is selected
  useEffect(() => {
    if (selectedCourse && !selectedModule) {
      const course = offlineCourses.find((c) => c.id === selectedCourse);
      if (course && course.modules.length > 0) {
        setSelectedModule(course.modules[0].id);
        setExpandedModules(new Set([course.modules[0].id]));
        if (course.modules[0].subtopics.length > 0) {
          setSelectedSubtopic(course.modules[0].subtopics[0].id);
        }
      }
    }
  }, [selectedCourse, selectedModule]);

  const handleDownload = (file: any, subtopic: any) => {
    toast({
      title: "Download Started",
      description: `Downloading ${file.name}...`,
    });

    const content = {
      id: `${subtopic.id}_${file.name}`,
      subtopicId: subtopic.id,
      subtopicTitle: subtopic.title,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      downloadedAt: new Date().toISOString(),
      content: `This is the content of ${file.name}. Practice material for ${subtopic.title}.\n\n${subtopic.title} contains practice exercises and materials to help you master the concepts.`,
    };

    saveDownloadedContent(content);
    setDownloadedContent([...downloadedContent, content]);

    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${file.name} has been downloaded successfully`,
      });
    }, 1500);
  };

  const filteredCourses = offlineCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCourseData = selectedCourse
    ? offlineCourses.find((c) => c.id === selectedCourse)
    : null;

  const selectedModuleData = selectedCourseData && selectedModule
    ? selectedCourseData.modules.find((m) => m.id === selectedModule)
    : null;

  const selectedSubtopicData = selectedModuleData && selectedSubtopic
    ? selectedModuleData.subtopics.find((s) => s.id === selectedSubtopic)
    : null;

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return FileText;
      case "zip":
      case "rar":
        return Archive;
      case "csv":
      case "xlsx":
      case "xls":
        return FileCode;
      default:
        return File;
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    setExpandedModules(new Set([moduleId]));
    if (selectedCourseData) {
      const module = selectedCourseData.modules.find((m) => m.id === moduleId);
      if (module && module.subtopics.length > 0) {
        setSelectedSubtopic(module.subtopics[0].id);
      }
    }
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleSubtopicSelect = (subtopicId: string) => {
    setSelectedSubtopic(subtopicId);
    // Toggle content expansion
    const newExpanded = new Set(expandedContents);
    if (newExpanded.has(subtopicId)) {
      newExpanded.delete(subtopicId);
    } else {
      newExpanded.add(subtopicId);
    }
    setExpandedContents(newExpanded);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const toggleContentExpansion = (subtopicId: string) => {
    const newExpanded = new Set(expandedContents);
    if (newExpanded.has(subtopicId)) {
      newExpanded.delete(subtopicId);
    } else {
      newExpanded.add(subtopicId);
    }
    setExpandedContents(newExpanded);
  };

  // Generate file-specific content for display with premium formatting
  const generateFileContent = (file: any, subtopic: any) => {
    // Generate unique content based on file name and type
    const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    const fileType = file.type.toLowerCase();
    const displayName = fileName.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
    
    let contentText = `# ${displayName}\n\n`;
    
    // Generate content based on file type and name
    if (fileType === "pdf") {
      contentText += `## 📚 Document Overview\n\nThis comprehensive PDF document provides detailed information and guidance on **${displayName}**. It's designed to help you master the concepts through structured learning and practical examples.\n\n`;
      contentText += `### 🎯 Key Topics Covered\n\n`;
      contentText += `- **Introduction & Fundamentals:** Understanding the basics of ${displayName}\n`;
      contentText += `- **Core Concepts:** Essential principles and theories\n`;
      contentText += `- **Practical Applications:** Real-world examples and case studies\n`;
      contentText += `- **Best Practices:** Industry-standard guidelines and recommendations\n`;
      contentText += `- **Advanced Strategies:** Implementation techniques and tips\n\n`;
      contentText += `### 📋 Document Information\n\n`;
      contentText += `- **File Name:** ${file.name}\n`;
      contentText += `- **File Size:** ${file.size}\n`;
      contentText += `- **Format:** PDF Document\n`;
      contentText += `- **Category:** ${subtopic.title}\n`;
      contentText += `- **Module:** ${selectedModuleData?.title || "N/A"}\n\n`;
      contentText += `### 💡 What You'll Learn\n\n`;
      contentText += `This document offers in-depth coverage of ${displayName} concepts, combining theoretical foundations with practical applications. The content is carefully structured to guide you from basic understanding to advanced implementation, ensuring you can apply these concepts confidently in real-world scenarios.\n\n`;
      contentText += `### 📖 How to Use This Document\n\n`;
      contentText += `1. **Start with the Introduction:** Get familiar with the overview and objectives\n`;
      contentText += `2. **Study Chapter by Chapter:** Follow the structured learning path\n`;
      contentText += `3. **Review Examples:** Understand practical applications through case studies\n`;
      contentText += `4. **Practice Exercises:** Complete the included exercises to reinforce learning\n`;
      contentText += `5. **Apply Knowledge:** Use the concepts in your own projects and work\n`;
    } else if (fileType === "zip") {
      contentText += `## 📦 Archive Contents\n\nThis ZIP archive contains a comprehensive collection of resources for **${displayName}**. All materials are organized and ready for you to use.\n\n`;
      contentText += `### 📊 Archive Information\n\n`;
      contentText += `- **File Name:** ${file.name}\n`;
      contentText += `- **File Size:** ${file.size}\n`;
      contentText += `- **Format:** ZIP Archive\n`;
      contentText += `- **Category:** ${subtopic.title}\n\n`;
      contentText += `### 📁 What's Inside\n\n`;
      contentText += `This archive includes valuable resources:\n\n`;
      contentText += `- **Templates & Examples:** Ready-to-use templates for your projects\n`;
      contentText += `- **Reference Materials:** Additional guides and documentation\n`;
      contentText += `- **Practice Files:** Exercises and sample projects to work with\n`;
      contentText += `- **Resources:** Supporting materials and tools\n\n`;
      contentText += `### 🚀 How to Use\n\n`;
      contentText += `1. **Download the Archive:** Save it to your preferred location\n`;
      contentText += `2. **Extract Files:** Unzip all contents to a dedicated folder\n`;
      contentText += `3. **Explore Structure:** Review the organization and file structure\n`;
      contentText += `4. **Use Templates:** Start with the provided templates as a base\n`;
      contentText += `5. **Practice & Learn:** Work through the exercises and examples\n`;
    } else if (fileType === "xlsx" || fileType === "xls") {
      contentText += `## 📊 Spreadsheet Overview\n\nThis Excel file contains structured data, templates, and calculations for **${displayName}**. It's designed to help you organize and analyze information effectively.\n\n`;
      contentText += `### 📋 File Information\n\n`;
      contentText += `- **File Name:** ${file.name}\n`;
      contentText += `- **File Size:** ${file.size}\n`;
      contentText += `- **Format:** Excel Spreadsheet\n`;
      contentText += `- **Category:** ${subtopic.title}\n\n`;
      contentText += `### 📑 Contents\n\n`;
      contentText += `This spreadsheet includes:\n\n`;
      contentText += `- **Data Tables:** Organized worksheets with structured data\n`;
      contentText += `- **Formulas & Functions:** Pre-configured calculations and formulas\n`;
      contentText += `- **Templates:** Ready-to-use templates for your own work\n`;
      contentText += `- **Sample Data:** Examples demonstrating best practices\n\n`;
      contentText += `### 💼 How to Use\n\n`;
      contentText += `1. **Open in Excel/Sheets:** Use Microsoft Excel or Google Sheets\n`;
      contentText += `2. **Review Structure:** Explore the worksheets and data organization\n`;
      contentText += `3. **Use Templates:** Copy templates for your own projects\n`;
      contentText += `4. **Customize:** Modify and adapt to your specific needs\n`;
      contentText += `5. **Learn from Examples:** Study the formulas and data structure\n`;
    } else {
      contentText += `## 📄 File Overview\n\nThis file contains valuable resources for **${displayName}**, part of the ${subtopic.title} practice materials.\n\n`;
      contentText += `### 📋 File Details\n\n`;
      contentText += `- **File Name:** ${file.name}\n`;
      contentText += `- **File Size:** ${file.size}\n`;
      contentText += `- **Format:** ${file.type.toUpperCase()}\n`;
      contentText += `- **Category:** ${subtopic.title}\n\n`;
      contentText += `### 📚 Description\n\n`;
      contentText += `This file is an essential part of the ${subtopic.title} learning materials. Download it to access the complete content, resources, and practice materials that will help you master the concepts.\n`;
    }
    
    const previewDoc: ParsedDocument = {
      title: displayName,
      content: contentText,
      metadata: {
        type: fileType,
        size: contentText.length,
        uploadedAt: new Date().toISOString(),
      },
      sections: [],
    };
    return formatDocumentForDisplay(previewDoc);
  };

  const toggleFileContent = (fileId: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId);
    } else {
      newExpanded.add(fileId);
    }
    setExpandedFiles(newExpanded);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20">
        <TopNavbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Back Button */}
          <div className="mb-4">
            <BackButton />
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                  Practice Materials & Downloads
                </h1>
                <p className="text-gray-600">
                  Download course materials and practice resources for offline learning
                </p>
              </div>
            </div>

            {/* Search */}
            {!selectedCourseData && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-6 text-base"
                />
              </div>
            )}
          </motion.div>

          {/* Course List or Course Details */}
          {!selectedCourseData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full overflow-hidden">
                    {course.cover && (
                      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-blue-600 to-indigo-600">
                        <Image
                          src={course.cover}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-blue-700 rounded-full text-xs font-semibold">
                            {course.category}
                          </span>
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{course.modules.length} Modules</span>
                        <span>
                          {course.modules.reduce((acc, m) => acc + m.subtopics.length, 0)} Practice Sets
                        </span>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => setSelectedCourse(course.id)}
                      >
                        View Materials
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Mobile Sidebar Toggle */}
              <div className="lg:hidden flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCourse(null)}
                  className="text-blue-600 border-blue-300"
                >
                  <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>

              {/* Course Header - Mobile */}
              <div className="lg:hidden mb-4">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{selectedCourseData.title}</h2>
                    <p className="text-blue-100">{selectedCourseData.description}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Modules List */}
              <motion.div
                initial={false}
                animate={{
                  x: sidebarOpen || !isMobile ? 0 : -320,
                  opacity: sidebarOpen || !isMobile ? 1 : 0,
                }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`
                  fixed lg:sticky top-0 left-0 h-full lg:h-auto z-50 lg:z-auto
                  w-80 lg:w-96 bg-white shadow-2xl lg:shadow-lg
                  border-r border-gray-200 overflow-y-auto
                  ${sidebarOpen || !isMobile ? "block" : "hidden"}
                `}
                style={{ maxHeight: "calc(100vh - 2rem)" }}
              >
                    {/* Desktop Course Header */}
                    <div className="hidden lg:block sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCourse(null)}
                        className="mb-4 text-gray-600 hover:text-gray-900"
                      >
                        <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                        Back to Courses
                      </Button>
                      <h2 className="text-2xl font-bold mb-2 text-gray-900">
                        {selectedCourseData.title}
                      </h2>
                      <p className="text-sm text-gray-600">{selectedCourseData.description}</p>
                    </div>

                    {/* Mobile Close Button */}
                    <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                      <h3 className="text-lg font-bold text-gray-900">Modules</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Modules List */}
                    <div className="p-4 lg:p-6 space-y-2">
                      {selectedCourseData.modules.map((module, index) => {
                        const isSelected = selectedModule === module.id;
                        const isExpanded = expandedModules.has(module.id);
                        const moduleProgress = module.subtopics.filter((s) =>
                          downloadedContent.some((d: any) => d.subtopicId === s.id)
                        ).length;
                        const totalSubtopics = module.subtopics.length;
                        const progressPercent = totalSubtopics > 0 ? (moduleProgress / totalSubtopics) * 100 : 0;

                        return (
                          <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card
                              className={`
                                cursor-pointer transition-all duration-200 border-2
                                ${isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-md"
                                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                                }
                              `}
                            >
                              <CardHeader
                                className="p-4"
                                onClick={() => handleModuleSelect(module.id)}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div
                                        className={`
                                          p-1.5 rounded-lg flex-shrink-0
                                          ${isSelected ? "bg-blue-600" : "bg-gray-100"}
                                        `}
                                      >
                                        <Package
                                          className={`h-4 w-4 ${isSelected ? "text-white" : "text-gray-600"}`}
                                        />
                                      </div>
                                      <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2">
                                        {module.title}
                                      </CardTitle>
                                    </div>
                                    {module.description && (
                                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                        {module.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      {module.duration && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{module.duration}</span>
                                        </div>
                                      )}
                                      <span>{totalSubtopics} Materials</span>
                                    </div>
                                    {totalSubtopics > 0 && (
                                      <div className="mt-2">
                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 0.5 }}
                                            className="h-full bg-blue-600 rounded-full"
                                          />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">
                                          {moduleProgress}/{totalSubtopics} downloaded
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleModule(module.id);
                                    }}
                                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>
                              </CardHeader>

                              {/* Subtopic List */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <CardContent className="pt-0 px-4 pb-4 space-y-1">
                                      {module.subtopics.map((subtopic) => {
                                        const isSubtopicSelected = selectedSubtopic === subtopic.id;
                                        const isDownloaded = downloadedContent.some(
                                          (d: any) => d.subtopicId === subtopic.id
                                        );

                                        return (
                                          <motion.button
                                            key={subtopic.id}
                                            onClick={() => handleSubtopicSelect(subtopic.id)}
                                            className={`
                                              w-full text-left p-3 rounded-lg transition-all
                                              ${isSubtopicSelected
                                                ? "bg-blue-100 border-2 border-blue-500"
                                                : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                                              }
                                            `}
                                          >
                                            <div className="flex items-start gap-2">
                                              <div
                                                className={`
                                                  p-1 rounded flex-shrink-0 mt-0.5
                                                  ${isSubtopicSelected ? "bg-blue-600" : "bg-gray-300"}
                                                `}
                                              >
                                                <FileText
                                                  className={`h-3 w-3 ${isSubtopicSelected ? "text-white" : "text-gray-600"}`}
                                                />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span
                                                    className={`
                                                      text-sm font-medium line-clamp-1
                                                      ${isSubtopicSelected ? "text-blue-900" : "text-gray-900"}
                                                    `}
                                                  >
                                                    {subtopic.title}
                                                  </span>
                                                  {isDownloaded && (
                                                    <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                  <FileCheck className="h-3 w-3" />
                                                  <span>{subtopic.files.length} files</span>
                                                </div>
                                              </div>
                                            </div>
                                          </motion.button>
                                        );
                                      })}
                                    </CardContent>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
              </motion.div>

              {/* Main Content Area - Expandable Dropdowns */}
              <div className="flex-1 min-w-0">
                {selectedCourseData ? (
                  <div className="space-y-4">
                    {selectedCourseData.modules.map((module) => (
                      <div key={module.id} className="space-y-3">
                        {module.subtopics.map((subtopic) => {
                          const isExpanded = expandedContents.has(subtopic.id);
                          const isDownloaded = downloadedContent.some(
                            (d: any) => d.subtopicId === subtopic.id
                          );

                          return (
                            <motion.div
                              key={subtopic.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden"
                            >
                              {/* Dropdown Header - Always Visible */}
                              <button
                                onClick={() => toggleContentExpansion(subtopic.id)}
                                className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div
                                      className={`
                                        p-2 rounded-lg flex-shrink-0
                                        ${isExpanded ? "bg-blue-600" : "bg-gray-100"}
                                      `}
                                    >
                                      <FileText
                                        className={`h-5 w-5 ${isExpanded ? "text-white" : "text-gray-600"}`}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2 tracking-tight">
                                          {subtopic.title}
                                        </h3>
                                        {isDownloaded && (
                                          <div className="flex-shrink-0 p-1 bg-green-100 rounded-full">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                                          <Package className="h-4 w-4" />
                                          <span className="font-semibold">{subtopic.files.length} files</span>
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-700 font-semibold">{module.title}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(subtopic.files[0], subtopic);
                                      }}
                                      className="border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 font-semibold shadow-md"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download All
                                    </Button>
                                    <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? "bg-blue-100" : "bg-gray-100"}`}>
                                      {isExpanded ? (
                                        <ChevronDown className="h-5 w-5 text-blue-600" />
                                      ) : (
                                        <ChevronRight className="h-5 w-5 text-gray-500" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>

                              {/* Expandable Content - Dropdown */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden border-t border-gray-200"
                                  >
                                    <div className="p-5 space-y-5 bg-gradient-to-br from-gray-50 to-white">
                                      {/* Files List */}
                                      <div>
                                        <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
                                          <div className="p-1.5 bg-blue-600 rounded-lg">
                                            <Package className="h-4 w-4 text-white" />
                                          </div>
                                          <span>Available Files</span>
                                          <span className="ml-auto text-sm font-semibold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">
                                            {subtopic.files.length}
                                          </span>
                                        </h4>
                                        <div className="space-y-2">
                                          {subtopic.files.map((file: any, index: number) => {
                                            const FileIcon = getFileIcon(file.type);
                                            const fileDownloaded = downloadedContent.some(
                                              (d: any) =>
                                                d.subtopicId === subtopic.id && d.fileName === file.name
                                            );
                                            const fileId = `${subtopic.id}_${file.name}`;
                                            const isFileExpanded = expandedFiles.has(fileId);
                                            const fileContent = generateFileContent(file, subtopic);

                                            return (
                                              <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all overflow-hidden shadow-sm"
                                              >
                                                {/* File Header */}
                                                <div className="flex items-center justify-between gap-3 p-4">
                                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex-shrink-0 shadow-sm">
                                                      <FileIcon className="h-5 w-5 text-blue-700" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <div className="font-bold text-base text-gray-900 truncate mb-1">
                                                        {file.name}
                                                      </div>
                                                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-semibold">
                                                          {file.type.toUpperCase()}
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="font-semibold">{file.size}</span>
                                                        {fileDownloaded && (
                                                          <>
                                                            <span className="text-gray-400">•</span>
                                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-md">
                                                              <CheckCircle2 className="h-3 w-3" />
                                                              <span className="font-semibold text-xs">Downloaded</span>
                                                            </div>
                                                          </>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFileContent(fileId);
                                                      }}
                                                      className="border-2 border-blue-400 text-blue-700 hover:bg-blue-50 hover:border-blue-500 font-semibold text-sm px-4 py-2 shadow-sm transition-all"
                                                    >
                                                      <Eye className="h-4 w-4 mr-1.5" />
                                                      View
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownload(file, subtopic);
                                                      }}
                                                      className="border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 font-semibold text-sm px-4 py-2 shadow-md transition-all"
                                                    >
                                                      <Download className="h-4 w-4 mr-1.5" />
                                                      Download
                                                    </Button>
                                                  </div>
                                                </div>

                                                {/* Expandable File Content Dropdown */}
                                                <AnimatePresence>
                                                  {isFileExpanded && (
                                                    <motion.div
                                                      initial={{ height: 0, opacity: 0 }}
                                                      animate={{ height: "auto", opacity: 1 }}
                                                      exit={{ height: 0, opacity: 0 }}
                                                      transition={{ duration: 0.3, ease: "easeInOut" }}
                                                      className="overflow-hidden border-t-2 border-blue-100"
                                                    >
                                                      <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                                                        <div className="max-w-none space-y-5">
                                                          {fileContent.map((block: any, blockIndex: number) => (
                                                            <motion.div
                                                              key={blockIndex}
                                                              initial={{ opacity: 0, y: 10 }}
                                                              animate={{ opacity: 1, y: 0 }}
                                                              transition={{ delay: blockIndex * 0.08, duration: 0.3 }}
                                                              className="mb-5 last:mb-0"
                                                            >
                                                              {block.type === "heading" && (
                                                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 tracking-tight leading-tight border-b-2 border-blue-200 pb-2">
                                                                  {block.content}
                                                                </h3>
                                                              )}
                                                              {block.type === "paragraph" && (
                                                                <p className="text-gray-800 leading-relaxed text-base mb-4 font-normal">
                                                                  {block.content}
                                                                </p>
                                                              )}
                                                              {block.type === "list" && block.items && (
                                                                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                                                  <ul className="space-y-2.5">
                                                                    {block.items.map((item: string, idx: number) => (
                                                                      <li key={idx} className="flex items-start gap-3 text-gray-800 text-base leading-relaxed">
                                                                        <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                                                        <span className="flex-1 font-medium">{item}</span>
                                                                      </li>
                                                                    ))}
                                                                  </ul>
                                                                </div>
                                                              )}
                                                            </motion.div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    </motion.div>
                                                  )}
                                                </AnimatePresence>
                                              </motion.div>
                                            );
                                          })}
                                        </div>
                                      </div>

                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Select a Course
                      </h3>
                      <p className="text-gray-600">
                        Choose a course from the list to view its modules and materials
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
