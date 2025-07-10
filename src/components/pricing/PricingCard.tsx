import React from 'react';
import { Check, Crown, Star } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { motion } from 'framer-motion';

interface PricingCardProps {
  plan: {
    name: string;
    price: number;
    period: string;
    features: string[];
    popular?: boolean;
    buttonText: string;
    buttonVariant?: 'primary' | 'outline';
  };
  onSelect: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <Star className="h-4 w-4 mr-1" />
            Most Popular
          </span>
        </div>
      )}
      
      <Card 
        className={`p-8 h-full ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : ''}`}
        hover={!plan.popular}
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {plan.name === 'Premium' && <Crown className="h-8 w-8 text-yellow-500" />}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
            <span className="text-gray-600 ml-2">/{plan.period}</span>
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onSelect}
          variant={plan.buttonVariant || 'primary'}
          className="w-full"
        >
          {plan.buttonText}
        </Button>
      </Card>
    </motion.div>
  );
};

export default PricingCard;