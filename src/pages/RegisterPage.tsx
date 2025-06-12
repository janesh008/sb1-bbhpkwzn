import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, User, Phone, Calendar, MapPin, Lock, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import toast from 'react-hot-toast';

interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dob: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  acceptTerms: boolean;
}

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Italy', 'Spain', 'Japan', 'India', 'China', 'Brazil', 'Other'
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showEmailVerification, setShowEmailVerification] = useState(false);


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<RegisterFormData>();

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');
  const watchedConfirmPassword = watch('confirmPassword');

  // Check email availability
  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) return;
    
    try {
      const { data } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (data) {
        setEmailExists(true);
        setError('email', { type: 'manual', message: 'Email already exists' });
      } else {
        setEmailExists(false);
        clearErrors('email');
      }
    } catch (error) {
      // Email doesn't exist, which is good
      setEmailExists(false);
      clearErrors('email');
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    
    setPasswordStrength(Math.min(100, strength));
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email && email.includes('@')) {
      const timeoutId = setTimeout(() => checkEmailAvailability(email), 500);
      return () => clearTimeout(timeoutId);
    }
  };

  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    calculatePasswordStrength(e.target.value);
  };

  // Handle phone input change - only allow numbers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    setValue('phone', numericValue);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-yellow-500';
    if (passwordStrength < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  // Updated registration handler with RLS approach
const handleRegister = async (email: string, password: string, formData: RegisterFormData) => {
  setIsLoading(true);

  try {
    // 1. Sign up user with Supabase Auth (and add role metadata if needed)
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          role: 'customer',
          full_name: formData.fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`, // optional, ensures proper redirect
      },
    });

    if (error) {
      toast.error(error.message || 'Sign-up failed');
      console.error(error);
      setIsLoading(false);
      return;
    }

    const userId = data?.user?.id;
    if (!userId) {
      toast.error('User registration failed — missing user ID');
      setIsLoading(false);
      return;
    }

    // 2. Insert into `users` table (custom table, not Supabase Auth table)
    const { error: insertError } = await supabase.from('users').insert([
      {
        auth_user_id: userId,
        full_name: formData.fullName,
        email: email.toLowerCase(),
        phone: formData.phone,
        dob: formData.dob || null,
        gender: formData.gender || null,
        country: formData.country || null,
        state: formData.state || null,
        city: formData.city || null,
        zip_code: formData.zipCode || null,
      },
    ]);

    if (insertError) {
      toast.error('Error saving user profile');
      console.error(insertError);
      setIsLoading(false);
      return;
    }

    // 3. Insert into `customers` table (optional, if you're using it separately)
    const { error: customerError } = await supabase.from('customers').insert([
      {
        user_id: userId,
        email: email.toLowerCase(),
        first_name: formData.fullName.split(' ')[0],
        last_name: formData.fullName.split(' ').slice(1).join(' '),
        phone: formData.phone,
        role: 'customer',
      },
    ]);

    if (customerError) {
      console.warn('Customer table insert failed (optional)', customerError.message);
    }

    toast.success('Account created! Please verify your email.');
    setShowEmailVerification(true);
  } catch (err: any) {
    console.error('Unhandled registration error:', err);
    toast.error(err.message || 'Registration failed');
  } finally {
    setIsLoading(false);
  }
};

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { type: 'manual', message: 'Passwords do not match' });
      return;
    }

    if (emailExists) {
      toast.error('Email already exists');
      return;
    }

    await handleRegister(data.email, data.password, data);
  };

  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-charcoal-800 rounded-2xl shadow-2xl p-8 border border-charcoal-700">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gold-400 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-charcoal-900" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-4">
                Verify Your Email
              </h2>
              <p className="text-charcoal-300 mb-6">
                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-gold-400 hover:bg-gold-500 text-charcoal-900"
                >
                  Go to Sign In
                </Button>
                <button
                  onClick={() => setShowEmailVerification(false)}
                  className="w-full text-gold-400 hover:text-gold-300 text-sm transition-colors"
                >
                  Back to Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Logo className="text-white justify-center mb-4" />
          <h2 className="text-3xl font-serif font-bold text-white mb-2">
            Create an Account
          </h2>
          <p className="text-cream-100">
            Join our exclusive jewelry collection
          </p>
          <p className="text-cream-200 text-sm mt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-charcoal-800 rounded-2xl shadow-2xl p-8 border border-charcoal-700">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                {...register('fullName', { required: 'Full name is required' })}
                className="w-full px-4 py-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  onChange={handleEmailChange}
                  className={`w-full px-4 py-3 bg-charcoal-700 border rounded-lg text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    emailExists ? 'border-red-500 focus:ring-red-400' : 'border-charcoal-600 focus:ring-gold-400'
                  }`}
                  placeholder="Enter your email address"
                />
                {watchedEmail && !emailExists && !errors.email && (
                  <Check className="absolute right-3 top-3 w-5 h-5 text-green-400" />
                )}
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                <Phone className="inline w-4 h-4 mr-2" />
                Mobile Number *
              </label>
              <input
                type="tel"
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: 'Please enter a valid phone number (10-15 digits)'
                  }
                })}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                placeholder="Enter your mobile number (numbers only)"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all pr-12"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-charcoal-400 hover:text-charcoal-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {watchedPassword && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-cream-200 mb-1">
                    <span>Password Strength</span>
                    <span>{getPasswordStrengthText()}</span>
                  </div>
                  <div className="w-full bg-charcoal-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: (value) => value === watchedPassword || 'Passwords do not match'
                  })}
                  className={`w-full px-4 py-3 bg-charcoal-700 border rounded-lg text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all pr-12 ${
                    watchedConfirmPassword && watchedConfirmPassword === watchedPassword 
                      ? 'border-green-500 focus:ring-green-400' 
                      : 'border-charcoal-600 focus:ring-gold-400'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-charcoal-400 hover:text-charcoal-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {watchedConfirmPassword && watchedConfirmPassword === watchedPassword && (
                  <Check className="absolute right-10 top-3 w-5 h-5 text-green-400" />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Date of Birth
              </label>
              <input
                type="date"
                {...register('dob')}
                className="w-full px-4 py-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all [color-scheme:dark]"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                Gender
              </label>
              <select
                {...register('gender')}
                className="w-full px-4 py-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
              >
                <option value="" className="text-charcoal-400">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Country
              </label>
              <select
                {...register('country')}
                className="w-full px-4 py-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
              >
                <option value="" className="text-charcoal-400">Select country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* State and City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cream-100 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  {...register('state')}
                  className="w-full px-4 py-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                  placeholder="State/Province"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cream-100 mb-2">
                  City
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full px-4 py-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                  placeholder="City"
                />
              </div>
            </div>

            {/* ZIP Code */}
            <div>
              <label className="block text-sm font-medium text-cream-100 mb-2">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                {...register('zipCode')}
                className="w-full px-4 py-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                placeholder="ZIP/Postal Code"
              />
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('acceptTerms', { required: 'You must accept the terms and conditions' })}
                  className="mt-1 w-4 h-4 text-gold-400 bg-charcoal-700 border-charcoal-600 rounded focus:ring-gold-400 focus:ring-2"
                />
                <span className="text-sm text-cream-200">
                  I agree to the{' '}
                  <Link to="/terms" className="text-gold-400 hover:text-gold-300 transition-colors">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-gold-400 hover:text-gold-300 transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-red-400 text-sm mt-1">{errors.acceptTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-charcoal-900 font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-charcoal-800"
            >
              Create Account
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-cream-200 text-sm">
            By creating an account, you're joining our exclusive community of jewelry enthusiasts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;