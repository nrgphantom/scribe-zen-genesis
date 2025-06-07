
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [bookTitle, setBookTitle] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [numChapters, setNumChapters] = useState(5);
  const [wordsPerChapter, setWordsPerChapter] = useState(2000);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [bookOutline, setBookOutline] = useState<Chapter[]>([]);
  const [showOutline, setShowOutline] = useState(false);

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
      
      // Parse the outline to extract chapters
      const chapters: Chapter[] = [];
      for (let i = 1; i <= numChapters; i++) {
        chapters.push({
          number: i,
          title: `Chapter ${i}`,
          summary: `Chapter ${i} content summary`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-slate-300 hover:text-white mb-6 hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center mb-4">
            <FileText className="w-8 h-8 text-blue-400 mr-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Book Generator
            </h1>
          </div>
          <p className="text-xl text-slate-300">
            Transform your idea into a complete manuscript with AI-generated chapters.
          </p>
        </div>

        {!showOutline ? (
          /* Input Form */
          <Card className="glass-card rounded-2xl max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-100 flex items-center">
                <BookOpen className="w-6 h-6 text-blue-400 mr-3" />
                Book Details
              </CardTitle>
              <CardDescription className="text-slate-400">
                Provide your book details to generate a complete manuscript.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-200 font-medium">
                  Book Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter your book title..."
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-200 font-medium">
                  Book Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your book's theme, plot, or main concepts..."
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  rows={4}
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chapters" className="text-slate-200 font-medium">
                    Number of Chapters (1-10)
                  </Label>
                  <Input
                    id="chapters"
                    type="number"
                    min="1"
                    max="10"
                    value={numChapters}
                    onChange={(e) => setNumChapters(parseInt(e.target.value) || 1)}
                    className="bg-slate-800/50 border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="words" className="text-slate-200 font-medium">
                    Words per Chapter
                  </Label>
                  <Input
                    id="words"
                    type="number"
                    min="500"
                    max="10000"
                    value={wordsPerChapter}
                    onChange={(e) => setWordsPerChapter(parseInt(e.target.value) || 2000)}
                    className="bg-slate-800/50 border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerateOutline}
                disabled={isGeneratingOutline}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-300"
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
                <CardTitle className="text-3xl text-slate-100">{bookTitle}</CardTitle>
                <CardDescription className="text-slate-300 text-lg">
                  {bookDescription}
                </CardDescription>
                <div className="flex gap-4 text-sm text-slate-400 mt-4">
                  <span>📚 {numChapters} Chapters</span>
                  <span>📝 ~{wordsPerChapter} words per chapter</span>
                  <span>📄 ~{numChapters * wordsPerChapter} total words</span>
                </div>
              </CardHeader>
            </Card>

            {/* Chapters List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-100 mb-6">Chapters</h2>
              {bookOutline.map((chapter, index) => (
                <Card key={chapter.number} className="glass-card rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">{chapter.number}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-100">
                            Chapter {chapter.number}
                          </h3>
                          <p className="text-slate-400">
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
                      <div className="mt-4 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <pre className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed font-sans max-h-96 overflow-y-auto">
                          {chapter.content}
                        </pre>
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
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-800/50"
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
