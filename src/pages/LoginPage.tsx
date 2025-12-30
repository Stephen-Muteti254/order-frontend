import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, remember);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-sidebar-foreground">
          <div className="mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-6">
              <span className="text-primary-foreground font-bold text-xl">O</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Order Management System</h1>
            <p className="text-lg text-sidebar-muted max-w-md">
              Streamline your workflow with powerful client, order, and invoice management tools.
            </p>
          </div>
          <div className="space-y-4 mt-12">
            <div className="flex items-center gap-3 text-sidebar-muted">
              <div className="h-8 w-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
                <span className="text-xs font-medium text-sidebar-accent-foreground">✓</span>
              </div>
              <span>Client & Order Management</span>
            </div>
            <div className="flex items-center gap-3 text-sidebar-muted">
              <div className="h-8 w-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
                <span className="text-xs font-medium text-sidebar-accent-foreground">✓</span>
              </div>
              <span>Invoice Generation & Reports</span>
            </div>
            <div className="flex items-center gap-3 text-sidebar-muted">
              <div className="h-8 w-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
                <span className="text-xs font-medium text-sidebar-accent-foreground">✓</span>
              </div>
              <span>PDF & Excel Export</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-accent/10 rounded-full blur-2xl" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8 lg:hidden">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-xl">O</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          </div>

          <div className="lg:mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button type="button" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Demo: Enter any email and password to login
          </p>
        </div>
      </div>
    </div>
  );
}
