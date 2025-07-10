import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const registerSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
});

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const schema = mode === 'login' ? loginSchema : registerSchema;
  const { register: registerField, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(data.email, data.password);
        toast.success('Welcome back!');
      } else {
        await register(data.name, data.email, data.password);
        toast.success('Account created successfully!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-600">
          {mode === 'login' 
            ? 'Sign in to your PDFEdit Pro account' 
            : 'Get started with your free account'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {mode === 'register' && (
          <Input
            label="Full Name"
            icon={<User className="h-5 w-5 text-gray-400" />}
            {...registerField('name')}
            error={errors.name?.message}
          />
        )}
        
        <Input
          label="Email"
          type="email"
          icon={<Mail className="h-5 w-5 text-gray-400" />}
          {...registerField('email')}
          error={errors.email?.message}
        />
        
        <Input
          label="Password"
          type="password"
          icon={<Lock className="h-5 w-5 text-gray-400" />}
          {...registerField('password')}
          error={errors.password?.message}
        />
        
        {mode === 'register' && (
          <Input
            label="Confirm Password"
            type="password"
            icon={<Lock className="h-5 w-5 text-gray-400" />}
            {...registerField('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
        )}
        
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>
    </Card>
  );
};

export default AuthForm;