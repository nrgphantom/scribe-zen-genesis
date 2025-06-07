import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { generateBookOutline, generateChapterContent } from "@/services/apiService";
import { toast } from "sonner";

interface Chapter {
  number: number;
  title: string;
  summary: string;
  content?: string;
  isGenerating?: boolean;
}

const BookGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get pre-filled data from navigation state
  const preFilledData = location.state as { title?: string; description?: string } | null;
  
  const [bookTitle, setBookTitle] = useState(preFilledData?.title || "");
  const [bookDescription, setBookDescription] = useState(preFilledData?.description || "");
  const [numChapters, setNumChapters] = useState(5);
  const [wordsPerChapter, setWordsPerChapter] = useState(2000);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [bookOutline, setBookOutline] = useState<Chapter[]>([]);
  const [showOutline, setShowOutline] = useState(false);
  const [generatedOutlineText, setGeneratedOutlineText] = useState("");

  const handleGenerateOutline = async () => {
    if (!bookTitle.trim() || !bookDescription.trim()) {
      toast.error("Please provide both book title and description.");
      return;
    }

    if (numChapters < 1 || numChapters > 10) {
      toast.error("Number of chapters must be between 1 and 10.");
      return;
    }

    setIsGeneratingOutline(true);
    
    try {
      console.log("Generating book outline:", { bookTitle, bookDescription, numChapters });
      const outline = await generateBookOutline(bookTitle, bookDescription, numChapters);
      setGeneratedOutlineText(outline);
      
      // Parse the outline to extract chapters
      const chapters: Chapter[] = [];
      const lines = outline.split('\n');
      let currentChapter = 1;
      
      for (let i = 0; i < lines.length && currentChapter <= numChapters; i++) {
        const line = lines[i].trim();
        if (line.toLowerCase().includes(`chapter ${currentChapter}`) || 
            line.match(new RegExp(`^${currentChapter}[\\.\\)\\:]`, 'i'))) {
          
          // Extract chapter title
          let chapterTitle = line.replace(/^(chapter\s*)?[\d\\.\\)\\:]+\s*/i, '').trim();
          if (chapterTitle.startsWith('-') || chapterTitle.startsWith('*')) {
            chapterTitle = chapterTitle.substring(1).trim();
          }
          
          // Get chapter summary from next few lines
          let summary = "";
          for (let j = i + 1; j < lines.length && j < i + 5; j++) {
            const summaryLine = lines[j].trim();
            if (summaryLine && !summaryLine.toLowerCase().includes(`chapter ${currentChapter + 1}`)) {
              summary += summaryLine + " ";
            } else {
              break;
            }
          }
          
          chapters.push({
            number: currentChapter,
            title: chapterTitle || `Chapter ${currentChapter}`,
            summary: summary.trim() || `Content for Chapter ${currentChapter}`,
          });
          
          currentChapter++;
        }
      }
      
      // If we couldn't parse enough chapters, fill in the remaining ones
      while (chapters.length < numChapters) {
        const chapterNum = chapters.length + 1;
        chapters.push({
          number: chapterNum,
          title: `Chapter ${chapterNum}`,
          summary: `Content for Chapter ${chapterNum}`,
        });
      }
      
      setBookOutline(chapters);
      setShowOutline(true);
      toast.success("Book outline generated successfully!");
    } catch (error) {
      console.error("Error generating outline:", error);
      toast.error("Failed to generate book outline. Please try again.");
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleGenerateChapter = async (chapterIndex: number) => {
    const chapter = bookOutline[chapterIndex];
    const updatedOutline = [...bookOutline];
    updatedOutline[chapterIndex] = { ...chapter, isGenerating: true };
    setBookOutline(updatedOutline);

    try {
      const previousChapters = bookOutline
        .slice(0, chapterIndex)
        .filter(ch => ch.content)
        .map(ch => ch.summary);

      const content = await generateChapterContent(
        bookTitle,
        chapter.title,
        chapter.number,
        bookDescription,
        wordsPerChapter,
        previousChapters
      );

      updatedOutline[chapterIndex] = { 
        ...chapter, 
        content,
        isGenerating: false 
      };
      setBookOutline(updatedOutline);
      toast.success(`Chapter ${chapter.number} generated successfully!`);
    } catch (error) {
      console.error("Error generating chapter:", error);
      updatedOutline[chapterIndex] = { ...chapter, isGenerating: false };
      setBookOutline(updatedOutline);
      toast.error(`Failed to generate Chapter ${chapter.number}. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-white hover:text-white mb-6 hover:bg-gray-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center mb-4">
            <FileText className="w-8 h-8 text-emerald-400 mr-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Book Generator
            </h1>
          </div>
          <p className="text-xl text-white">
            Transform your idea into a complete manuscript with AI-generated chapters.
          </p>
        </div>

        {!showOutline ? (
          /* Input Form */
          <Card className="glass-card rounded-2xl max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <BookOpen className="w-6 h-6 text-emerald-400 mr-3" />
                Book Details
              </CardTitle>
              <CardDescription className="text-gray-400">
                Provide your book details to generate a complete manuscript.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white font-medium">
                  Book Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter your book title..."
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-medium">
                  Book Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your book's theme, plot, or main concepts..."
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  rows={4}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chapters" className="text-white font-medium">
                    Number of Chapters (1-10)
                  </Label>
                  <Input
                    id="chapters"
                    type="number"
                    min="1"
                    max="10"
                    value={numChapters}
                    onChange={(e) => setNumChapters(parseInt(e.target.value) || 1)}
                    className="bg-gray-800/50 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="words" className="text-white font-medium">
                    Words per Chapter
                  </Label>
                  <Input
                    id="words"
                    type="number"
                    min="500"
                    max="10000"
                    value={wordsPerChapter}
                    onChange={(e) => setWordsPerChapter(parseInt(e.target.value) || 2000)}
                    className="bg-gray-800/50 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerateOutline}
                disabled={isGeneratingOutline}
                className="w-full glass-button text-white font-semibold py-3 rounded-xl"
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
            </CardContent>
          </Card>
        ) : (
          /* Book Outline & Chapter Generation */
          <div className="space-y-8">
            {/* Book Info Header */}
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-3xl text-white">{bookTitle}</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  {bookDescription}
                </CardDescription>
                <div className="flex gap-4 text-sm text-gray-400 mt-4">
                  <span>📚 {numChapters} Chapters</span>
                  <span>📝 ~{wordsPerChapter} words per chapter</span>
                  <span>📄 ~{numChapters * wordsPerChapter} total words</span>
                </div>
              </CardHeader>
            </Card>

            {/* Generated Outline */}
            {generatedOutlineText && (
              <Card className="glass-card rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Generated Outline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <div className="text-white whitespace-pre-wrap text-sm leading-relaxed font-sans max-h-96 overflow-y-auto prose prose-invert">
                      {generatedOutlineText}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chapters List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Chapters</h2>
              {bookOutline.map((chapter, index) => (
                <Card key={chapter.number} className="glass-card rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">{chapter.number}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            Chapter {chapter.number}
                          </h3>
                          <p className="text-gray-400">
                            {chapter.title}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleGenerateChapter(index)}
                        disabled={chapter.isGenerating}
                        className="glass-button"
                        size="sm"
                      >
                        {chapter.isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Writing...
                          </>
                        ) : chapter.content ? (
                          <>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Regenerate
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Write Chapter
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {chapter.content && (
                      <div className="mt-4 bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                        <div className="text-white whitespace-pre-wrap text-sm leading-relaxed font-sans max-h-96 overflow-y-auto prose prose-invert">
                          {chapter.content}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowOutline(false);
                  setBookOutline([]);
                  setGeneratedOutlineText("");
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
              >
                Start New Book
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookGenerator;
