import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { generateBookOutline, generateChapterContent } from "@/services/apiService";
import { toast } from "sonner";

interface Chapter {
  id: number;
  title: string;
  content: string;
  isGenerating: boolean;
}

const BookGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bookTitle, setBookTitle] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [totalChapters, setTotalChapters] = useState(10);
  const [targetWordsPerChapter, setTargetWordsPerChapter] = useState(2000);
  const [outline, setOutline] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [bookType, setBookType] = useState<"fiction" | "nonfiction">("fiction");

  useEffect(() => {
    if (location.state) {
      const { title, description, numChapters, bookType: stateBookType } = location.state;
      if (title) setBookTitle(title);
      if (description) setBookDescription(description);
      if (numChapters) setTotalChapters(numChapters);
      if (stateBookType) setBookType(stateBookType);
    }
  }, [location.state]);

  const generateOutline = async () => {
    if (!bookTitle.trim() || !bookDescription.trim() || totalChapters < 1 || totalChapters > 50) {
      toast.error("Please fill in all required fields with valid values.");
      return;
    }

    setIsGeneratingOutline(true);
    setOutline("");
    setChapters([]);
    
    try {
      const outlineText = await generateBookOutline(bookTitle, bookDescription, totalChapters, bookType);
      setOutline(outlineText);
      
      // Extract chapter titles from outline
      const chapterMatches = outlineText.match(/Chapter \d+: ([^\n]+)/g);
      if (chapterMatches) {
        const extractedChapters = chapterMatches.map((match, index) => {
          const titleMatch = match.match(/Chapter \d+: (.+)/);
          return {
            id: index + 1,
            title: titleMatch ? titleMatch[1].trim() : `Chapter ${index + 1}`,
            content: "",
            isGenerating: false
          };
        });
        setChapters(extractedChapters);
      }
      
      toast.success("Book outline generated successfully!");
    } catch (error) {
      console.error("Error generating outline:", error);
      toast.error("Failed to generate outline. Please try again.");
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const generateChapter = async (chapterId: number) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    setChapters(prev => prev.map(c => 
      c.id === chapterId ? { ...c, isGenerating: true } : c
    ));

    try {
      const previousChapters = chapters
        .filter(c => c.id < chapterId && c.content)
        .map(c => c.title);

      const content = await generateChapterContent(
        bookTitle,
        chapter.title,
        chapterId,
        bookDescription,
        targetWordsPerChapter,
        previousChapters,
        bookType
      );

      setChapters(prev => prev.map(c => 
        c.id === chapterId ? { ...c, content, isGenerating: false } : c
      ));

      toast.success(`Chapter ${chapterId} generated successfully!`);
    } catch (error) {
      console.error(`Error generating chapter ${chapterId}:`, error);
      toast.error(`Failed to generate Chapter ${chapterId}. Please try again.`);
      
      setChapters(prev => prev.map(c => 
        c.id === chapterId ? { ...c, isGenerating: false } : c
      ));
    }
  };

  const handleBack = () => {
    navigate("/book-idea-generator");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Professional Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/pen.png" 
                alt="ZedScribe Logo" 
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">ZedScribe</h1>
                <p className="text-sm text-gray-300">Professional AI Book Writing Platform</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-white hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Full Book Generator</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your book concept into a complete manuscript with AI-powered chapter generation
          </p>
        </div>

        {/* Book Setup Form */}
        <Card className="mb-8 bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white font-bold flex items-center">
              <BookOpen className="w-6 h-6 text-purple-400 mr-3" />
              Book Configuration
            </CardTitle>
            <CardDescription className="text-gray-300 text-base">
              Set up your {bookType === "fiction" ? "fictional" : "non-fictional"} book details to begin the writing process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white font-semibold">Book Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter your book title"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapters" className="text-white font-semibold">Total Chapters (1-50) *</Label>
                <Input
                  id="chapters"
                  type="number"
                  min="1"
                  max="50"
                  value={totalChapters}
                  onChange={(e) => setTotalChapters(parseInt(e.target.value) || 1)}
                  className="bg-white/5 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white font-semibold">Book Description *</Label>
              <Textarea
                id="description"
                placeholder={`Describe your ${bookType} book concept, main themes, and objectives...`}
                value={bookDescription}
                onChange={(e) => setBookDescription(e.target.value)}
                rows={4}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 rounded-lg border border-purple-500/20">
              <div className="flex items-center space-x-3">
                {bookType === "fiction" ? (
                  <BookOpen className="w-5 h-5 text-purple-400" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                )}
                <span className="text-white font-semibold">
                  Book Type: {bookType === "fiction" ? "Fiction" : "Non-Fiction"}
                </span>
              </div>
              <Button
                onClick={generateOutline}
                disabled={isGeneratingOutline}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2"
              >
                {isGeneratingOutline ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Outline...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Book Outline
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Outline Display */}
        {outline && (
          <Card className="mb-8 bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white font-bold">Book Outline</CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Review the generated outline and chapter titles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/20 text-gray-200 whitespace-pre-wrap">
                {outline}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chapter Generation */}
        {chapters.length > 0 && (
          <div className="space-y-6">
            {chapters.map((chapter) => (
              <Card key={chapter.id} className="bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white font-semibold">
                    Chapter {chapter.id}: {chapter.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-base">
                    Generate content for this chapter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chapter.isGenerating ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 text-purple-400 animate-spin mr-2" />
                      <p className="text-gray-300">Generating chapter content...</p>
                    </div>
                  ) : (
                    <>
                      {chapter.content ? (
                        <div className="bg-white/5 p-4 rounded-lg border border-white/20 text-gray-200 whitespace-pre-wrap">
                          {chapter.content}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-4">
                          Click the button below to generate content for this chapter.
                        </div>
                      )}
                      <Button
                        onClick={() => generateChapter(chapter.id)}
                        disabled={chapter.isGenerating}
                        className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3"
                      >
                        Generate Chapter Content
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookGenerator;
