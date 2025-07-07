
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb, Loader2, LogOut, BookOpen, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateBookIdea } from "@/services/apiService";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import ProfileModal from "@/components/ProfileModal";

const BookIdeaGenerator = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [bookType, setBookType] = useState<"fiction" | "nonfiction">("fiction");
  const [numChapters, setNumChapters] = useState<number | "">("");
  const [customDescription, setCustomDescription] = useState("");
  const [generatedIdea, setGeneratedIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const generateIdea = async () => {
    if (!numChapters) {
      toast.error("Please enter the number of chapters.");
      return;
    }

    if (numChapters < 1 || numChapters > 50) {
      toast.error("Number of chapters must be between 1 and 50.");
      return;
    }

    setIsGenerating(true);
    setGeneratedIdea("");
    
    try {
      const idea = await generateBookIdea(
        topic, 
        targetAudience, 
        bookType, 
        numChapters, 
        customDescription
      );
      setGeneratedIdea(idea);
      
      if (customDescription && customDescription.trim()) {
        toast.success("Using your custom book description!");
      } else {
        toast.success("Book idea generated successfully!");
      }
    } catch (error) {
      console.error("Error generating idea:", error);
      toast.error("Failed to generate idea. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTurnIntoBook = () => {
    if (!generatedIdea) {
      toast.error("Please generate a book idea first.");
      return;
    }

    // If using custom description, extract title differently
    if (customDescription && customDescription.trim()) {
      navigate("/book-generator", {
        state: {
          title: `My ${bookType === "fiction" ? "Fiction" : "Non-Fiction"} Book`,
          description: generatedIdea,
          numChapters,
          bookType
        }
      });
      return;
    }

    const lines = generatedIdea.split('\n');
    const titleLine = lines.find(line => line.toLowerCase().includes('title:'));
    const descriptionLines = lines.filter(line => 
      !line.toLowerCase().includes('title:') && 
      !line.toLowerCase().includes('chapter') && 
      line.trim() !== ''
    );

    const title = titleLine ? titleLine.replace(/title:\s*/i, '').trim() : '';
    const description = descriptionLines.join(' ').trim();

    navigate("/book-generator", {
      state: {
        title,
        description,
        numChapters,
        bookType
      }
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.username || profile?.full_name || user?.email;

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
              <div className="flex items-center space-x-2 text-gray-300">
                <User className="w-4 h-4" />
                <span className="text-sm">{displayName}</span>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setShowProfileModal(true)}
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Book Idea Generator</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Transform your concepts into compelling book ideas with AI assistance
          </p>
        </div>

        {/* Input Form */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white font-bold flex items-center">
              <Lightbulb className="w-6 h-6 text-yellow-400 mr-3" />
              Generate Your Book Idea
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Fill in what you know, leave the rest blank (except chapters) and we'll generate it for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white font-semibold">Book Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="If you have a book idea in mind, describe it here. Otherwise, leave blank and we'll generate one for you based on the fields below."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600/20 min-h-[100px]"
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-white font-semibold">Topic/Theme (Optional)</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Space exploration, Medieval fantasy, Personal finance"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience" className="text-white font-semibold">Target Audience (Optional)</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Young adults, Business professionals, Children"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600/20"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="book-type" className="text-white font-semibold">Book Type *</Label>
                <Select value={bookType} onValueChange={(value: "fiction" | "nonfiction") => setBookType(value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-gray-600 focus:ring-gray-600/20">
                    <SelectValue placeholder="Select book type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="fiction" className="text-white hover:bg-gray-700">Fiction</SelectItem>
                    <SelectItem value="nonfiction" className="text-white hover:bg-gray-700">Non-Fiction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapters" className="text-white font-semibold">Number of Chapters (1-50) *</Label>
                <Input
                  id="chapters"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Enter number of chapters"
                  value={numChapters}
                  onChange={(e) => setNumChapters(e.target.value ? parseInt(e.target.value) : "")}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600/20"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={generateIdea}
                disabled={isGenerating}
                className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Idea...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Generate Book Idea
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Idea Display */}
        {generatedIdea && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white font-bold">Your Generated Book Idea</CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Here's your book concept ready for development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {generatedIdea}
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleTurnIntoBook}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 text-lg"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Turn This Into a Full Book
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </div>
  );
};

export default BookIdeaGenerator;
