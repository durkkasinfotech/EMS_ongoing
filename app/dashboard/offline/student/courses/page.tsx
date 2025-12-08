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
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  // Generate content for display
  const generateContent = (subtopic: any) => {
    const previewText = `# ${subtopic.title}\n\nThis is comprehensive practice material for ${subtopic.title}.\n\n## Overview\n\n${subtopic.title} contains practice exercises and materials to help you master the concepts. Download the files to access the complete content.\n\n## Available Resources\n\n${subtopic.files.map((f: any) => `- **${f.name}** (${f.size})`).join('\n')}\n\n## Learning Objectives\n\n- Understand the core concepts\n- Practice with real-world examples\n- Apply knowledge through exercises\n- Master the techniques\n\n## Next Steps\n\n1. Download the materials\n2. Review the content\n3. Practice with the exercises\n4. Apply what you've learned`;
    
    const previewDoc: ParsedDocument = {
      title: subtopic.title,
      content: previewText,
      metadata: {
        type: "text",
        size: previewText.length,
        uploadedAt: new Date().toISOString(),
      },
      sections: [],
    };
    return formatDocumentForDisplay(previewDoc);
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

              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                {selectedSubtopicData ? (
                  <motion.div
                    key={selectedSubtopic}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Content Header */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-5 w-5" />
                              <h2 className="text-2xl font-bold">{selectedSubtopicData.title}</h2>
                            </div>
                            <p className="text-blue-100">
                              Practice material for {selectedModuleData?.title}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Files Section */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-blue-600" />
                          Available Files ({selectedSubtopicData.files.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedSubtopicData.files.map((file: any, index: number) => {
                            const FileIcon = getFileIcon(file.type);
                            const fileDownloaded = downloadedContent.some(
                              (d: any) =>
                                d.subtopicId === selectedSubtopicData.id && d.fileName === file.name
                            );

                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all overflow-hidden"
                              >
                                <div className="flex items-center justify-between p-4">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-2 bg-white rounded-lg border border-gray-200 flex-shrink-0">
                                      <FileIcon className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-900 mb-1 truncate">
                                        {file.name}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>{file.type.toUpperCase()}</span>
                                        <span>•</span>
                                        <span>{file.size}</span>
                                        {fileDownloaded && (
                                          <>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                              <span className="text-blue-600">Downloaded</span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const content = generateContent(selectedSubtopicData);
                                        // Open in new window or modal
                                        toast({
                                          title: "Viewing Content",
                                          description: "Content preview opened",
                                        });
                                      }}
                                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDownload(file, selectedSubtopicData)}
                                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Content Preview */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Content Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          {generateContent(selectedSubtopicData).map((block: any, index: number) => (
                            <div key={index} className="mb-4">
                              {block.type === "heading" && (
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {block.content}
                                </h3>
                              )}
                              {block.type === "paragraph" && (
                                <p className="text-gray-700 leading-relaxed">{block.content}</p>
                              )}
                              {block.type === "list" && block.items && (
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                                  {block.items.map((item: string, idx: number) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Select a Module
                      </h3>
                      <p className="text-gray-600">
                        Choose a module from the sidebar to view its content and materials
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
