import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Mail, Lock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/config";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockFirestore } from "@/lib/mockFirebase";
import { authService } from "@/services/firebaseService";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        loginData.email, 
        loginData.password
      );
      
      // Check if user profile exists in Firestore
      try {
        const userProfile = await authService.checkUserProfile(loginData.email);
        
        if (!userProfile) {
          // First-time user - redirect to profile setup
          toast.success("Welcome! Please complete your profile setup.");
          navigate("/profile-setup", { 
            state: { 
              email: userCredential.user.email,
              uid: userCredential.user.uid,
              isFirstTime: true 
            } 
          });
        } else {
          // Existing user - store their data from Firestore
          localStorage.setItem('currentUser', JSON.stringify({
            ...userProfile,
            uid: userCredential.user.uid
          }));
          
          console.log('✅ User logged in successfully:', {
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role
          });
          
          toast.success(`Welcome back, ${userProfile.firstName}! 🎉`);
          navigate("/dashboard");
        }
      } catch (profileError) {
        console.error("Profile check failed:", profileError);
        // Fallback to basic login if Firestore check fails
        localStorage.setItem('currentUser', JSON.stringify({
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || userCredential.user.email
        }));
        toast.success(`Welcome back, ${userCredential.user.email}!`);
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">StockMaster</h1>
              <p className="text-sm text-muted-foreground">Inventory Management</p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{showForgotPassword ? "Reset Password" : "Welcome Back"}</CardTitle>
            <CardDescription>
              {showForgotPassword 
                ? "Enter your email to receive a password reset link"
                : "Sign in to your account"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              /* Forgot Password Form */
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-9"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Email"}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              /* Login Form */
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Only registered users can access the system. New accounts must be created by an administrator.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-9"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm text-muted-foreground"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Need an account? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
