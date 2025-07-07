
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Loader2, GraduationCap, LogOut, User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { generateBookOutline, generateChapterContent } from "@/services/apiService";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionModal from "@/components/SubscriptionModal";

interface Chapter {
  id: number;
  title: string;
  content: string;
  isGenerating: boolean;
}

const BookGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { subscription, canGenerateChapter, remainingChapters, updateChapterCount } = useSubscription();
  
  const [bookTitle, setBookTitle] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [totalChapters, setTotalChapters] = useState<number | "">("");
  const [outline, setOutline] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [bookType, setBookType] = useState<"fiction" | "nonfiction">("fiction");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

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
    if (!bookTitle.trim() || !bookDescription.trim() || !totalChapters || totalChapters < 1 || totalChapters > 50) {
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
    if (!canGenerateChapter()) {
      setShowSubscriptionModal(true);
      return;
    }

    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    setChapters(prev => prev.map(c => 
      c.id === chapterId ? { ...c, isGenerating: true } : c
    ));

    try {
      const previousChapters = chapters
        .filter(c => c.id < chapterId && c.content)
        .map(c => c.title);

      const targetWords = subscription?.subscribed ? 2000 : 500;

      const content = await generateChapterContent(
        bookTitle,
        chapter.title,
        chapterId,
        bookDescription,
        targetWords,
        previousChapters,
        bookType
      );

      setChapters(prev => prev.map(c => 
        c.id === chapterId ? { ...c, content, isGenerating: false } : c
      ));

      await updateChapterCount();
      toast.success(`Chapter ${chapterId} generated successfully!`);
    } catch (error) {
      console.error(`Error generating chapter ${chapterId}:`, error);
      toast.error(`Failed to generate Chapter ${chapterId}. Please try again.`);
      
      setChapters(prev => prev.map(c => 
        c.id === chapterId ? { ...c, isGenerating: false } : c
      ));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black">
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
                <p className="text-sm text-gray-400">AI-Powered Book Writing Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4 text-gray-300">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                {subscription && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-full">
                    {subscription.subscribed ? (
                      <>
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold">Premium</span>
                      </>
                    ) : (
                      <span className="text-sm">Free: {remainingChapters()} chapters left</span>
                    )}
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/book-idea-generator")}
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Ideas
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Full Book Generator</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Transform your book concept into a complete manuscript with AI-powered chapter generation
          </p>
        </div>

        {/* Book Setup Form */}
        <Card className="mb-8 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white font-bold flex items-center">
              <BookOpen className="w-6 h-6 text-blue-400 mr-3" />
              Book Configuration
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
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
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapters" className="text-white font-semibold">Total Chapters (1-50) *</Label>
                <Input
                  id="chapters"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Enter number of chapters"
                  value={totalChapters}
                  onChange={(e) => setTotalChapters(e.target.value ? parseInt(e.target.value) : "")}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600/20"
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
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3">
                {bookType === "fiction" ? (
                  <BookOpen className="w-5 h-5 text-blue-400" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-green-400" />
                )}
                <span className="text-white font-semibold">
                  Book Type: {bookType === "fiction" ? "Fiction" : "Non-Fiction"}
                </span>
              </div>
              <Button
                onClick={generateOutline}
                disabled={isGeneratingOutline}
                className="bg-white text-black hover:bg-gray-200 font-semibold px-6 py-2"
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
          <Card className="mb-8 bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white font-bold">Book Outline</CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Review the generated outline and chapter titles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-gray-200 whitespace-pre-wrap">
                {outline}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chapter Generation */}
        {chapters.length > 0 && (
          <div className="space-y-6">
            {chapters.map((chapter) => (
              <Card key={chapter.id} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white font-semibold">
                    Chapter {chapter.id}: {chapter.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    {subscription?.subscribed ? "Full chapter content (2000+ words)" : "Free trial content (500 words)"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {chapter.isGenerating ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-blue-400 animate-spin mr-2" />
                      <p className="text-gray-300">Generating chapter content...</p>
                    </div>
                  ) : (
                    <>
                      {chapter.content ? (
                        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {chapter.content}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8 bg-gray-800 rounded-lg border border-gray-700">
                          <p className="mb-4">Click the button below to generate content for this chapter</p>
                          {!subscription?.subscribed && (
                            <p className="text-sm text-yellow-400">
                              Free trial: {remainingChapters()} chapters remaining
                            </p>
                          )}
                        </div>
                      )}
                      <Button
                        onClick={() => generateChapter(chapter.id)}
                        disabled={chapter.isGenerating}
                        className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-3"
                      >
                        {canGenerateChapter() ? "Generate Chapter Content" : "Upgrade to Generate"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        remainingChapters={remainingChapters()}
      />
    </div>
  );
};

export default BookGenerator;
