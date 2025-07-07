
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Zap } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingChapters: number;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  remainingChapters 
}) => {
  const handleUpgrade = (plan: 'monthly' | 'yearly') => {
    // In a real application, this would integrate with Stripe
    console.log(`Upgrading to ${plan} plan`);
    // For now, we'll just show a message
    alert(`Stripe integration would be implemented here for ${plan} plan`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-gray-800 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            You have {remainingChapters} free chapters remaining. Unlock unlimited access!
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-center text-white">Monthly Plan</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Perfect for getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-white mb-4">
                $5<span className="text-lg text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center justify-center text-gray-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Unlimited chapters
                </li>
                <li className="flex items-center justify-center text-gray-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Full-length chapters (2000+ words)
                </li>
                <li className="flex items-center justify-center text-gray-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Priority support
                </li>
                <li className="flex items-center justify-center text-gray-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Export to PDF
                </li>
              </ul>
              <Button 
                onClick={() => handleUpgrade('monthly')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Choose Monthly
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-600/50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-600 text-black px-3 py-1 rounded-full text-sm font-semibold">
                BEST VALUE
              </span>
            </div>
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <CardTitle className="text-center text-white">Yearly Plan</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Save 17% with annual billing
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-white mb-4">
                $50<span className="text-lg text-gray-400">/year</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center justify-center text-gray-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Unlimited chapters
                </li>
                <li className="flex items-center justify-center text-gray-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Full-length chapters (2000+ words)
                </li>
                <li className="flex items-center justify-center text-gray-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Priority support
                </li>
                <li className="flex items-center justify-center text-gray-300">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Export to PDF
                </li>
                <li className="flex items-center justify-center text-yellow-400">
                  <Crown className="w-4 h-4 mr-2" />
                  Save $10/year
                </li>
              </ul>
              <Button 
                onClick={() => handleUpgrade('yearly')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold"
              >
                Choose Yearly
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
