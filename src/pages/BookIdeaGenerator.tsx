
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { generateBookIdea } from "@/services/apiService";
import { toast } from "sonner";

const BookIdeaGenerator = () => {
  const navigate = useNavigate();
  const [bookName, setBookName] = useState("");
  const [description, setDescription] = useState("");
  const [numChapters, setNumChapters] = useState(5);
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
      console.log("Generating book idea with:", { bookName, description, numChapters });
      const idea = await generateBookIdea(bookName.trim() || undefined, description.trim() || undefined, numChapters);
      setGeneratedIdea(idea);
      toast.success("Book idea generated successfully!");
    } catch (error) {
      console.error("Error generating book idea:", error);
      toast.error("Failed to generate book idea. Please try again.");
    } finally {
      setIsGenerating(false);
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
          numChapters: numChapters
        }
      });
    } else {
      navigate("/book-generator", {
        state: {
          numChapters: numChapters
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
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
            <BookOpen className="w-8 h-8 text-white mr-4" />
            <h1 className="text-4xl font-light text-white tracking-tight">
              Book Idea Generator
            </h1>
          </div>
          <p className="text-xl text-gray-400 font-light">
            Let AI spark your creativity with unique book concepts and detailed outlines.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="text-2xl text-white font-light flex items-center">
                <Sparkles className="w-6 h-6 text-white mr-3" />
                Create Your Idea
              </CardTitle>
              <CardDescription className="text-gray-400 font-light">
                Provide any details you have, or leave blank for completely random generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bookName" className="text-white font-light">
                  Book Name (Optional)
                </Label>
                <Input
                  id="bookName"
                  placeholder="Enter a book title if you have one in mind..."
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="minimal-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-light">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe any themes, genres, or concepts you'd like to explore..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="minimal-input resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapters" className="text-white font-light">
                  Number of Chapters (1-50) *
                </Label>
                <Input
                  id="chapters"
                  type="number"
                  min="1"
                  max="50"
                  value={numChapters}
                  onChange={(e) => setNumChapters(parseInt(e.target.value) || 1)}
                  className="minimal-input"
                  required
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full minimal-button py-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Idea...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Book Idea
                  </>
                )}
              </Button>

              <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800/50">
                <p className="text-sm text-gray-400 text-center font-light">
                  💡 <strong>Tip:</strong> Leave fields empty for completely random, creative ideas!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Generated Idea Display */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="text-2xl text-white font-light">Generated Idea</CardTitle>
              <CardDescription className="text-gray-400 font-light">
                Your AI-generated book concept will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  <p className="text-gray-400 font-light">Creating your unique book idea...</p>
                </div>
              ) : generatedIdea ? (
                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800/50">
                    <div className="text-content whitespace-pre-wrap text-sm">
                      {generatedIdea}
                    </div>
                  </div>
                  <Button 
                    onClick={handleTurnIntoFullBook}
                    className="w-full minimal-button py-3"
                  >
                    Turn This Into a Full Book
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-center font-light">
                    Your generated book idea will appear here after clicking "Generate Book Idea"
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
