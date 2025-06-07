import { Book, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 pt-12">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-white mr-4" />
            <h1 className="text-6xl font-light text-white tracking-tight">
              ZedScribe
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Professional AI-powered book writing. From concepts to complete manuscripts.
          </p>
        </div>

        {/* Main Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Book Idea Generator Card */}
          <Card className="minimal-card card-hover cursor-pointer" 
                onClick={() => navigate("/book-idea-generator")}>
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-4">
                <Book className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-2xl font-light text-white">
                Book Idea Generator
              </CardTitle>
              <CardDescription className="text-gray-400 text-base leading-relaxed font-light">
                Generate compelling book concepts, themes, and detailed outlines. 
                Perfect for overcoming writer's block and discovering your next project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-300 font-light">
                  <div className="w-1 h-1 bg-white rounded-full mr-3"></div>
                  Generate compelling book titles
                </div>
                <div className="flex items-center text-sm text-gray-300 font-light">
                  <div className="w-1 h-1 bg-white rounded-full mr-3"></div>
                  Create detailed story outlines
                </div>
                <div className="flex items-center text-sm text-gray-300 font-light">
                  <div className="w-1 h-1 bg-white rounded-full mr-3"></div>
                  Explore themes and concepts
                </div>
              </div>
              <Button className="w-full minimal-button py-3">
                Generate Ideas
              </Button>
            </CardContent>
          </Card>

          {/* Book Generator Card */}
          <Card className="minimal-card card-hover cursor-pointer" 
                onClick={() => navigate("/book-generator")}>
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-2xl font-light text-white">
                Book Generator
              </CardTitle>
              <CardDescription className="text-gray-400 text-base leading-relaxed font-light">
                Transform your ideas into complete manuscripts. Generate full chapters 
                with customizable length and professional structure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-300 font-light">
                  <div className="w-1 h-1 bg-white rounded-full mr-3"></div>
                  Create chapter-by-chapter content
                </div>
                <div className="flex items-center text-sm text-gray-300 font-light">
                  <div className="w-1 h-1 bg-white rounded-full mr-3"></div>
                  Customize word count per chapter
                </div>
                <div className="flex items-center text-sm text-gray-300 font-light">
                  <div className="w-1 h-1 bg-white rounded-full mr-3"></div>
                  Professional manuscript structure
                </div>
              </div>
              <Button className="w-full minimal-button py-3">
                Start Writing
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-light text-white mb-12">Why Choose ZedScribe?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="minimal-card p-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-medium text-lg">AI</span>
              </div>
              <h3 className="text-xl font-light text-white mb-3">AI-Powered</h3>
              <p className="text-gray-400 font-light">Advanced AI models that understand storytelling and create engaging content.</p>
            </div>
            <div className="minimal-card p-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-medium text-lg">⚡</span>
              </div>
              <h3 className="text-xl font-light text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400 font-light">Generate complete chapters in seconds, not hours.</p>
            </div>
            <div className="minimal-card p-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-medium text-lg">✨</span>
              </div>
              <h3 className="text-xl font-light text-white mb-3">Professional Quality</h3>
              <p className="text-gray-400 font-light">Publication-ready content with proper structure and flow.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;