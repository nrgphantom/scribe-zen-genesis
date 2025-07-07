
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, PenTool, Zap, Star, Users, Crown, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/book-idea-generator");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/pen.png" 
                alt="ZedScribe Logo" 
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-2xl font-bold">ZedScribe</h1>
                <p className="text-xs text-gray-400">AI-Powered Book Writing</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button 
                  onClick={() => navigate("/book-idea-generator")}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate("/auth")}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Write Your Book with
            <span className="block text-gray-400">AI Assistance</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into complete books with our AI-powered writing platform. 
            Generate compelling chapters, develop characters, and bring your stories to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4"
            >
              <PenTool className="w-5 h-5 mr-2" />
              Start Writing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Writing Tools</h2>
            <p className="text-xl text-gray-400">Everything you need to write your next bestseller</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI-Powered Ideas</h3>
              <p className="text-gray-400 leading-relaxed">
                Generate unique book concepts and detailed outlines with advanced AI assistance
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Chapter Generation</h3>
              <p className="text-gray-400 leading-relaxed">
                Create compelling chapters with consistent tone, style, and narrative flow
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Genre Flexibility</h3>
              <p className="text-gray-400 leading-relaxed">
                Write fiction or non-fiction with specialized AI models for each genre
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400">Start free, upgrade when you're ready</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Free Trial</h3>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>5 chapters included</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>500 words per chapter</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Book idea generation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Both fiction & non-fiction</span>
                </li>
              </ul>
              <Button 
                onClick={handleGetStarted}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white"
              >
                Get Started Free
              </Button>
            </div>

            {/* Monthly Plan */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Monthly</h3>
              <div className="text-4xl font-bold mb-6">
                $5<span className="text-lg text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Unlimited chapters</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>2000+ words per chapter</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Export to PDF</span>
                </li>
              </ul>
              <Button 
                onClick={handleGetStarted}
                className="w-full bg-white text-black hover:bg-gray-200"
              >
                Choose Monthly
              </Button>
            </div>

            {/* Yearly Plan */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-600/50 rounded-lg p-8 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-600 text-black px-3 py-1 rounded-full text-sm font-semibold">
                  BEST VALUE
                </span>
              </div>
              <div className="flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-yellow-400 mr-2" />
                <h3 className="text-2xl font-bold">Yearly</h3>
              </div>
              <div className="text-4xl font-bold mb-6">
                $50<span className="text-lg text-gray-400">/year</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Unlimited chapters</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>2000+ words per chapter</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Export to PDF</span>
                </li>
                <li className="flex items-center">
                  <Crown className="w-5 h-5 text-yellow-400 mr-3" />
                  <span className="text-yellow-400">Save $10/year</span>
                </li>
              </ul>
              <Button 
                onClick={handleGetStarted}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold"
              >
                Choose Yearly
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Write Your Story?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of authors who are already using AI to bring their stories to life.
          </p>
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4"
          >
            <PenTool className="w-5 h-5 mr-2" />
            Start Your Book Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/pen.png" 
              alt="ZedScribe Logo" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold">ZedScribe</span>
          </div>
          <p className="text-gray-400">
            © 2024 ZedScribe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
