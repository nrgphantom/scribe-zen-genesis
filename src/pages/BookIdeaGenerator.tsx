
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedIdea("");
    
    try {
      console.log("Generating book idea with:", { bookName, description });
      const idea = await generateBookIdea(bookName.trim() || undefined, description.trim() || undefined);
      setGeneratedIdea(idea);
      toast.success("Book idea generated successfully!");
    } catch (error) {
      console.error("Error generating book idea:", error);
      toast.error("Failed to generate book idea. Please try again.");
    } finally {
      setIsGenerating(false);
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
            className="text-white hover:text-white mb-6 hover:bg-gray-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-emerald-400 mr-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Book Idea Generator
            </h1>
          </div>
          <p className="text-xl text-white">
            Let AI spark your creativity with unique book concepts and detailed outlines.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Sparkles className="w-6 h-6 text-emerald-400 mr-3" />
                Create Your Idea
              </CardTitle>
              <CardDescription className="text-gray-400">
                Provide any details you have, or leave blank for completely random generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bookName" className="text-white font-medium">
                  Book Name (Optional)
                </Label>
                <Input
                  id="bookName"
                  placeholder="Enter a book title if you have one in mind..."
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-medium">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe any themes, genres, or concepts you'd like to explore..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full glass-button text-white font-semibold py-3 rounded-xl"
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

              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <p className="text-sm text-gray-400 text-center">
                  💡 <strong>Tip:</strong> Leave fields empty for completely random, creative ideas!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Generated Idea Display */}
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Generated Idea</CardTitle>
              <CardDescription className="text-gray-400">
                Your AI-generated book concept will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-gray-400">Creating your unique book idea...</p>
                </div>
              ) : generatedIdea ? (
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <pre className="text-white whitespace-pre-wrap text-sm leading-relaxed font-sans">
                      {generatedIdea}
                    </pre>
                  </div>
                  <Button 
                    onClick={() => navigate("/book-generator")}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    Turn This Into a Full Book
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-center">
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
