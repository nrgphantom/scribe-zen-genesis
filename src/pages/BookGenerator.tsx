import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, FileText, Loader2, Edit3, Copy, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { generateBookOutline, generateChapterContent } from "@/services/apiService";
import { toast } from "sonner";
import jsPDF from 'jspdf';

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
  
  const preFilledData = location.state as { title?: string; description?: string; numChapters?: number } | null;
  
  const [bookTitle, setBookTitle] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [numChapters, setNumChapters] = useState(5);
  const [wordsPerChapter, setWordsPerChapter] = useState(2000);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingAllChapters, setIsGeneratingAllChapters] = useState(false);
  const [bookOutline, setBookOutline] = useState<Chapter[]>([]);
  const [showOutline, setShowOutline] = useState(false);

  useEffect(() => {
    if (preFilledData) {
      if (preFilledData.title) setBookTitle(preFilledData.title);
      if (preFilledData.description) setBookDescription(preFilledData.description);
      if (preFilledData.numChapters) setNumChapters(preFilledData.numChapters);
    }
  }, [preFilledData]);

  const handleGenerateOutline = async () => {
    if (!bookTitle.trim() || !bookDescription.trim()) {
      toast.error("Please provide both book title and description.");
      return;
    }

    if (numChapters < 1 || numChapters > 50) {
      toast.error("Number of chapters must be between 1 and 50.");
      return;
    }

    setIsGeneratingOutline(true);
    
    try {
      console.log("Generating book outline:", { bookTitle, bookDescription, numChapters });
      const outline = await generateBookOutline(bookTitle, bookDescription, numChapters);
      
      const chapters: Chapter[] = [];
      const lines = outline.split('\n');
      let currentChapter = 1;
      
      for (let i = 0; i < lines.length && currentChapter <= numChapters; i++) {
        const line = lines[i].trim();
        if (line.toLowerCase().includes(`chapter ${currentChapter}`) || 
            line.match(new RegExp(`^${currentChapter}[\\.\\)\\:]`, 'i'))) {
          
          let chapterTitle = line.replace(/^(chapter\s*)?[\d\\.\\)\\:]+\s*/i, '').trim();
          if (chapterTitle.startsWith('-') || chapterTitle.startsWith('*')) {
            chapterTitle = chapterTitle.substring(1).trim();
          }
          
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
    
    // Update state to show loading
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

      // Update state with generated content
      const finalOutline = [...bookOutline];
      finalOutline[chapterIndex] = { 
        ...chapter, 
        content: content,
        isGenerating: false 
      };
      setBookOutline(finalOutline);
      toast.success(`Chapter ${chapter.number} generated successfully!`);
    } catch (error) {
      console.error("Error generating chapter:", error);
      // Update state to remove loading
      const errorOutline = [...bookOutline];
      errorOutline[chapterIndex] = { ...chapter, isGenerating: false };
      setBookOutline(errorOutline);
      toast.error(`Failed to generate Chapter ${chapter.number}. Please try again.`);
    }
  };

  const handleGenerateAllChapters = async () => {
    if (bookOutline.length === 0) {
      toast.error("Please generate a book outline first.");
      return;
    }

    setIsGeneratingAllChapters(true);
    
    try {
      // Mark all chapters as generating
      const updatedOutline = bookOutline.map(chapter => ({
        ...chapter,
        isGenerating: true
      }));
      setBookOutline(updatedOutline);

      // Generate chapters sequentially to maintain context
      for (let i = 0; i < bookOutline.length; i++) {
        const chapter = bookOutline[i];
        
        try {
          const previousChapters = bookOutline
            .slice(0, i)
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

          // Update this specific chapter
          setBookOutline(prevOutline => {
            const newOutline = [...prevOutline];
            newOutline[i] = {
              ...chapter,
              content: content,
              isGenerating: false
            };
            return newOutline;
          });

          toast.success(`Chapter ${chapter.number} completed!`);
          
          // Small delay between chapters to prevent rate limiting
          if (i < bookOutline.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error generating chapter ${chapter.number}:`, error);
          
          // Mark this chapter as failed
          setBookOutline(prevOutline => {
            const newOutline = [...prevOutline];
            newOutline[i] = {
              ...chapter,
              isGenerating: false
            };
            return newOutline;
          });
          
          toast.error(`Failed to generate Chapter ${chapter.number}`);
        }
      }

      toast.success("All chapters generation completed!");
    } catch (error) {
      console.error("Error in batch generation:", error);
      toast.error("Failed to generate all chapters. Please try individual chapters.");
    } finally {
      setIsGeneratingAllChapters(false);
      
      // Ensure no chapters are left in generating state
      setBookOutline(prevOutline => 
        prevOutline.map(chapter => ({
          ...chapter,
          isGenerating: false
        }))
      );
    }
  };

  const handleCopyChapter = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Chapter content copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy text to clipboard.");
    }
  };

  const handleDownloadChapterPDF = (chapter: Chapter) => {
    if (!chapter.content) return;

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(`${bookTitle}`, margin, 30);
      
      // Add chapter title
      pdf.setFontSize(16);
      pdf.text(`Chapter ${chapter.number}: ${chapter.title}`, margin, 50);
      
      // Add generated date
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 65);
      
      // Add content
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(chapter.content, maxWidth);
      pdf.text(lines, margin, 80);
      
      // Save the PDF
      const fileName = `${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chapter_${chapter.number}.pdf`;
      pdf.save(fileName);
      
      toast.success("Chapter PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF.");
    }
  };

  const handleDownloadFullBookPDF = () => {
    const chaptersWithContent = bookOutline.filter(ch => ch.content);
    if (chaptersWithContent.length === 0) {
      toast.error("No chapters with content to download.");
      return;
    }

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = 30;
      
      // Add book title
      pdf.setFontSize(24);
      pdf.text(bookTitle, margin, yPosition);
      yPosition += 20;
      
      // Add book description
      pdf.setFontSize(12);
      const descLines = pdf.splitTextToSize(bookDescription, maxWidth);
      pdf.text(descLines, margin, yPosition);
      yPosition += descLines.length * 6 + 20;
      
      // Add generated date
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 30;
      
      // Add chapters
      chaptersWithContent.forEach((chapter, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Add chapter title
        pdf.setFontSize(16);
        pdf.text(`Chapter ${chapter.number}: ${chapter.title}`, margin, yPosition);
        yPosition += 15;
        
        // Add chapter content
        pdf.setFontSize(12);
        const contentLines = pdf.splitTextToSize(chapter.content!, maxWidth);
        
        contentLines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 30;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 6;
        });
        
        yPosition += 20; // Space between chapters
      });
      
      // Save the PDF
      const fileName = `${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_full_book.pdf`;
      pdf.save(fileName);
      
      toast.success("Full book PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF.");
    }
  };

  const getGenerationProgress = () => {
    const totalChapters = bookOutline.length;
    const completedChapters = bookOutline.filter(ch => ch.content).length;
    const generatingChapters = bookOutline.filter(ch => ch.isGenerating).length;
    
    return {
      total: totalChapters,
      completed: completedChapters,
      generating: generatingChapters,
      percentage: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
    };
  };

  const progress = getGenerationProgress();

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-white hover:text-white mb-6 hover:bg-gray-900/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center mb-4">
            <img 
              src="/pen.png" 
              alt="ZedScribe Logo" 
              className="w-8 h-8 mr-4"
            />
            <h1 className="text-4xl font-light text-white tracking-tight">
              Book Generator
            </h1>
          </div>
          <p className="text-xl text-gray-400 font-light">
            Transform your idea into a complete manuscript with AI-generated chapters.
          </p>
        </div>

        {!showOutline ? (
          <Card className="minimal-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-white font-light flex items-center">
                <FileText className="w-6 h-6 text-white mr-3" />
                Book Details
              </CardTitle>
              <CardDescription className="text-gray-400 font-light">
                Provide your book details to generate a complete manuscript.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white font-light">
                  Book Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter your book title..."
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="minimal-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-light">
                  Book Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your book's theme, plot, or main concepts..."
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  rows={4}
                  className="minimal-input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chapters" className="text-white font-light">
                    Number of Chapters (1-50)
                  </Label>
                  <Input
                    id="chapters"
                    type="number"
                    min="1"
                    max="50"
                    value={numChapters}
                    onChange={(e) => setNumChapters(parseInt(e.target.value) || 1)}
                    className="minimal-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="words" className="text-white font-light">
                    Words per Chapter (500-50,000)
                  </Label>
                  <Input
                    id="words"
                    type="number"
                    min="500"
                    max="50000"
                    value={wordsPerChapter}
                    onChange={(e) => setWordsPerChapter(parseInt(e.target.value) || 2000)}
                    className="minimal-input"
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerateOutline}
                disabled={isGeneratingOutline}
                className="w-full minimal-button py-3"
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
          <div className="space-y-8">
            {/* Book Info Header */}
            <Card className="minimal-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl text-white font-light">{bookTitle}</CardTitle>
                    <CardDescription className="text-gray-300 text-lg font-light mt-2">
                      {bookDescription}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-gray-400 mt-4 font-light">
                      <span>📚 {numChapters} Chapters</span>
                      <span>📝 ~{wordsPerChapter} words per chapter</span>
                      <span>📄 ~{numChapters * wordsPerChapter} total words</span>
                      {progress.total > 0 && (
                        <span>✅ {progress.completed}/{progress.total} completed ({progress.percentage}%)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleGenerateAllChapters}
                      disabled={isGeneratingAllChapters || progress.generating > 0}
                      className="minimal-button"
                    >
                      {isGeneratingAllChapters ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Writing All...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Write All Chapters
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={handleDownloadFullBookPDF}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-900/50"
                      disabled={bookOutline.filter(ch => ch.content).length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Full Book
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Progress Indicator */}
            {isGeneratingAllChapters && (
              <Card className="minimal-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-light">Generating All Chapters</span>
                    <span className="text-gray-400 text-sm">{progress.completed}/{progress.total} completed</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2 font-light">
                    Please wait while we generate all chapters. This may take several minutes.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Chapters List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-light text-white mb-6">Chapters</h2>
              {bookOutline.map((chapter, index) => (
                <Card key={`chapter-${chapter.number}`} className="minimal-card">
                  <CardContent className="p-6">
                    {/* Chapter Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-black font-medium">{chapter.number}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-light text-white">
                            Chapter {chapter.number}: {chapter.title}
                          </h3>
                          <p className="text-gray-400 font-light text-sm mt-1">
                            {chapter.summary}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {chapter.content && (
                          <>
                            <Button
                              onClick={() => handleCopyChapter(chapter.content!)}
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-300 hover:bg-gray-900/50"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDownloadChapterPDF(chapter)}
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-300 hover:bg-gray-900/50"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleGenerateChapter(index)}
                          disabled={chapter.isGenerating || isGeneratingAllChapters}
                          className="minimal-button flex-shrink-0"
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
                    </div>
                    
                    {/* Chapter Content */}
                    {chapter.content && (
                      <div className="mt-6 bg-gray-900/50 rounded-lg p-6 border border-gray-800/50">
                        <div className="text-content whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto">
                          {chapter.content}
                        </div>
                      </div>
                    )}

                    {/* Loading State */}
                    {chapter.isGenerating && (
                      <div className="mt-6 bg-gray-900/50 rounded-lg p-6 border border-gray-800/50">
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-white animate-spin mr-3" />
                          <span className="text-gray-300 font-light">Generating chapter content...</span>
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
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-900/50"
                disabled={isGeneratingAllChapters}
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