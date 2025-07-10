import React from 'react';
import { useAuth } from '../context/AuthContext';
import PricingCard from '../components/pricing/PricingCard';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Pricing: React.FC = () => {
  const { user, updateUser } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      features: [
        '3 PDF edits per month',
        'Basic editing tools',
        'Text annotations',
        'File upload up to 10MB',
        'Standard support'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Premium',
      price: 12,
      period: 'month',
      features: [
        'Unlimited PDF edits',
        'Advanced editing tools',
        'Text, image, and form editing',
        'File upload up to 100MB',
        'Priority support',
        'Cloud storage',
        'Team collaboration',
        'Export to multiple formats'
      ],
      popular: true,
      buttonText: 'Upgrade to Premium',
      buttonVariant: 'primary' as const
    },
    {
      name: 'Enterprise',
      price: 29,
      period: 'month',
      features: [
        'Everything in Premium',
        'Custom integrations',
        'API access',
        'Advanced security',
        'Dedicated account manager',
        'Custom branding',
        'SLA guarantee',
        'Advanced analytics'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline' as const
    }
  ];

  const handlePlanSelect = (planName: string) => {
    if (planName === 'Premium' && user) {
      // Simulate upgrade process
      updateUser({ isPremium: true });
      toast.success('Successfully upgraded to Premium! 🎉');
    } else if (planName === 'Enterprise') {
      toast.success('Sales team will contact you within 24 hours!');
    } else {
      toast.info('You are already on the Free plan');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our free plan and upgrade when you need more power. 
            All plans include our core PDF editing features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan}
              onSelect={() => handlePlanSelect(plan.name)}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What counts as an edit?
                </h3>
                <p className="text-gray-600">
                  An edit is any modification to your PDF - adding text, annotations, 
                  images, or making changes to existing content.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I cancel my subscription?
                </h3>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time. You'll continue 
                  to have access until the end of your billing period.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is my data secure?
                </h3>
                <p className="text-gray-600">
                  Absolutely. We use enterprise-grade encryption and security measures 
                  to protect your documents and data.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-gray-600">
                  We offer a 30-day money-back guarantee for all paid plans. 
                  Contact support if you're not satisfied.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;