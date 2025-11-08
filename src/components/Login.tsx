import { useState } from "react";
import { apiLogin } from "../lib/api"; 
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Eye, EyeOff, Palette } from "lucide-react";

interface LoginProps {
  // onLogin no longer accepts a token argument
  onLogin: () => void; 
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setIsLoading(true);
    try {
      const data = await apiLogin(email, password); // token is stored in apiLogin
      
      // CRITICAL: Check if a token was received and call the parent handler
      if (data?.token) { 
        onLogin(); // Call parent to update state and navigate
      } else {
        throw new Error("Login successful, but token missing from response.");
      }
    } catch (e: any) {
      setErr(e?.message || "Login failed (API Error)");
    } finally {
      setIsLoading(false);
    }
  }

  function handleDemoLogin() {
    setEmail("sarah.designer@designstudio.com");
    setPassword("demo123");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Palette className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DesignStudio Pro</h1>
          <p className="text-gray-600 mt-2">Interior Design Project Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to manage your interior design projects</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={handleDemoLogin}>
                Load Demo Account
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p>Demo credentials:</p>
                <p>Email: sarah.designer@designstudio.com</p>
                <p>Password: demo123</p>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                Forgot your password?{" "}
                <a href="#" className="text-primary hover:underline">
                  Reset it here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 DesignStudio Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}