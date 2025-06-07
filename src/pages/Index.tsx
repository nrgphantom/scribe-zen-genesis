
import { Book, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 pt-12">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-emerald-400 mr-4" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              ZedScribe
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Unleash your creativity with AI-powered book writing. From ideas to complete manuscripts, 
            your writing journey starts here.
          </p>
        </div>

        {/* Main Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Book Idea Generator Card */}
          <Card className="glass-card card-hover rounded-2xl overflow-hidden group cursor-pointer" 
                onClick={() => navigate("/book-idea-generator")}>
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:animate-glow">
                <Book className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                Book Idea Generator
              </CardTitle>
              <CardDescription className="text-slate-400 text-base leading-relaxed">
                Spark your creativity with AI-generated book concepts, themes, and outlines. 
                Perfect for overcoming writer's block and discovering your next bestseller.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-300">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  Generate compelling book titles
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  Create detailed story outlines
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  Explore themes and concepts
                </div>
              </div>
              <Button className="w-full glass-button text-white font-semibold py-3 rounded-xl">
                Start Generating Ideas
              </Button>
            </CardContent>
          </Card>

          {/* Book Generator Card */}
          <Card className="glass-card card-hover rounded-2xl overflow-hidden group cursor-pointer" 
                onClick={() => navigate("/book-generator")}>
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:animate-glow">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                Book Generator
              </CardTitle>
              <CardDescription className="text-slate-400 text-base leading-relaxed">
                Transform your ideas into complete manuscripts. Generate full chapters 
                with customizable length and professional content structure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Create chapter-by-chapter content
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Customize word count per chapter
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Professional manuscript structure
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 border border-blue-400/20 shadow-lg hover:shadow-blue-500/25">
                Start Writing Book
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-slate-100 mb-12">Why Choose ZedScribe?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">AI-Powered</h3>
              <p className="text-slate-400">Advanced AI models that understand storytelling and create engaging content.</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">Lightning Fast</h3>
              <p className="text-slate-400">Generate complete chapters in seconds, not hours.</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">Professional Quality</h3>
              <p className="text-slate-400">Publication-ready content with proper structure and flow.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
