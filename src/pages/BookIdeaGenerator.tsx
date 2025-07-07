
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, Copy, Download, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateBookIdea } from "@/services/apiService";
import { toast } from "sonner";
import jsPDF from 'jspdf';

const BookIdeaGenerator = () => {
  const navigate = useNavigate();
  const [bookName, setBookName] = useState("");
  const [description, setDescription] = useState("");
  const [numChapters, setNumChapters] = useState(5);
  const [bookType, setBookType] = useState<"fiction" | "nonfiction">("fiction");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState("");

  const handleGenerate = async () => {
    if (numChapters < 1 || numChapters > 50) {
      toast.error("Number of chapters must be between 1 and 50.");
      return;
    }

    setIsGenerating(true);
    setGeneratedIdea("");
    
    try {
      console.log("Generating book idea with:", { bookName, description, numChapters, bookType });
      const idea = await generateBookIdea(bookName.trim() || undefined, description.trim() || undefined, numChapters, bookType);
      setGeneratedIdea(idea);
      toast.success("Book idea generated successfully!");
    } catch (error) {
      console.error("Error generating book idea:", error);
      toast.error("Failed to generate book idea. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = async () => {
    if (!generatedIdea) return;
    
    try {
      await navigator.clipboard.writeText(generatedIdea);
      toast.success("Text copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy text to clipboard.");
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedIdea) return;

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Add title
      pdf.setFontSize(20);
      pdf.text("Book Idea - ZedScribe", margin, 30);
      
      // Add generated date
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 45);
      
      // Add content
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(generatedIdea, maxWidth);
      pdf.text(lines, margin, 60);
      
      // Save the PDF
      const fileName = bookName ? `${bookName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_idea.pdf` : 'book_idea.pdf';
      pdf.save(fileName);
      
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF.");
    }
  };

  const extractBookDetails = (generatedText: string) => {
    let title = "";
    let description = "";
    
    const lines = generatedText.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.toLowerCase().includes('title:') && !title) {
        title = line.split(':')[1]?.trim() || "";
        title = title.replace(/[*#"`]/g, '').trim();
      } else if (line.startsWith('#') && !title) {
        title = line.replace(/^#+\s*/, '').replace(/[*"`]/g, '').trim();
      }
      
      if ((line.toLowerCase().includes('description:') || 
           line.toLowerCase().includes('summary:') || 
           line.toLowerCase().includes('overview:')) && !description) {
        let desc = line.split(':')[1]?.trim() || "";
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.toLowerCase().includes(':') && !nextLine.startsWith('#')) {
            desc += " " + nextLine;
          } else {
            break;
          }
        }
        description = desc.replace(/[*#"`]/g, '').trim();
      }
    }
    
    if (!title && bookName) {
      title = bookName;
    } else if (!title) {
      const firstMeaningfulLine = lines.find(line => 
        line.trim() && 
        !line.includes('generate') && 
        !line.includes('idea') &&
        line.length > 10
      );
      if (firstMeaningfulLine) {
        title = firstMeaningfulLine.replace(/[*#"`]/g, '').trim().substring(0, 100);
      }
    }
    
    if (!description) {
      const paragraphs = generatedText.split('\n\n');
      const firstParagraph = paragraphs.find(p => 
        p.trim().length > 50 && 
        !p.toLowerCase().includes('title:') &&
        !p.startsWith('#')
      );
      if (firstParagraph) {
        description = firstParagraph.replace(/[*#"`]/g, '').trim().substring(0, 300);
      }
    }
    
    return {
      title: title.substring(0, 100),
      description: description.substring(0, 500)
    };
  };

  const handleTurnIntoFullBook = () => {
    if (generatedIdea) {
      const { title, description } = extractBookDetails(generatedIdea);
      navigate("/book-generator", {
        state: {
          title: title || bookName || "Untitled Book",
          description: description || generatedIdea.substring(0, 300),
          numChapters: numChapters,
          bookType: bookType
        }
      });
    } else {
      navigate("/book-generator", {
        state: {
          numChapters: numChapters,
          bookType: bookType
        }
      });
    }
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
        {/* Page Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Book Idea Generator</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your creative vision into a comprehensive book concept with AI-powered precision. 
            Choose between fiction and non-fiction to get tailored, professional-grade ideas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Input Form */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-white font-bold flex items-center">
                <Sparkles className="w-6 h-6 text-purple-400 mr-3" />
                Create Your Book Concept
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Provide your preferences below to generate a professional book concept tailored to your vision.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Book Type Selection */}
              <div className="space-y-4">
                <Label className="text-white font-semibold text-base">Book Type *</Label>
                <RadioGroup 
                  value={bookType} 
                  onValueChange={(value) => setBookType(value as "fiction" | "nonfiction")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <RadioGroupItem value="fiction" id="fiction" className="border-purple-400 text-purple-400" />
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      <label htmlFor="fiction" className="text-white font-medium cursor-pointer">
                        Fiction
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <RadioGroupItem value="nonfiction" id="nonfiction" className="border-blue-400 text-blue-400" />
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5 text-blue-400" />
                      <label htmlFor="nonfiction" className="text-white font-medium cursor-pointer">
                        Non-Fiction
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookName" className="text-white font-semibold">
                  Book Title (Optional)
                </Label>
                <Input
                  id="bookName"
                  placeholder="Enter a book title if you have one in mind..."
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-semibold">
                  Book Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder={bookType === "fiction" 
                    ? "Describe themes, characters, plot ideas, or setting you'd like to explore..." 
                    : "Describe the topic, target audience, key concepts, or problems you want to address..."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapters" className="text-white font-semibold">
                  Number of Chapters (1-50) *
                </Label>
                <Input
                  id="chapters"
                  type="number"
                  min="1"
                  max="50"
                  value={numChapters}
                  onChange={(e) => setNumChapters(parseInt(e.target.value) || 1)}
                  className="bg-white/5 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400/20"
                  required
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your {bookType === "fiction" ? "Fiction" : "Non-Fiction"} Idea...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate {bookType === "fiction" ? "Fiction" : "Non-Fiction"} Book Idea
                  </>
                )}
              </Button>

              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                <p className="text-sm text-gray-300 text-center">
                  💡 <strong>Pro Tip:</strong> {bookType === "fiction" 
                    ? "Leave fields empty for completely original fictional concepts with unique characters and plots!"
                    : "Leave fields empty for well-researched, fact-based concepts with real-world applications!"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Generated Idea Display */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white font-bold">Generated Book Concept</CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Your AI-generated {bookType === "fiction" ? "fictional" : "non-fictional"} book concept will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                  <p className="text-gray-300 font-medium text-lg">Creating your unique book concept...</p>
                  <p className="text-gray-400 text-sm">
                    {bookType === "fiction" 
                      ? "Crafting compelling characters and narrative..." 
                      : "Researching facts and structuring informative content..."
                    }
                  </p>
                </div>
              ) : generatedIdea ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-6 border border-white/10 backdrop-blur-sm">
                    <div className="text-content whitespace-pre-wrap text-gray-100 leading-relaxed">
                      {generatedIdea}
                    </div>
                  </div>
                  
                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleCopyText}
                        variant="outline"
                        className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </Button>
                      <Button 
                        onClick={handleDownloadPDF}
                        variant="outline"
                        className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                    <Button 
                      onClick={handleTurnIntoFullBook}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Turn This Into a Full {bookType === "fiction" ? "Fiction" : "Non-Fiction"} Book
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <div className="bg-white/5 rounded-full p-6 mb-6">
                    <img 
                      src="/pen.png" 
                      alt="ZedScribe Logo" 
                      className="w-16 h-16 opacity-60"
                    />
                  </div>
                  <p className="text-center font-medium text-lg mb-2">
                    Ready to Generate Your Book Concept
                  </p>
                  <p className="text-center text-gray-500">
                    Your professional {bookType} book idea will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookIdeaGenerator;
