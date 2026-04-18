import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Github, Chrome } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export function AuthScreens({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { signIn } = useAuth();

  const handleAuth = async () => {
    try {
      await signIn();
      onAuthSuccess();
    } catch (error) {
      console.error("Auth failed", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-slate-200 shadow-xl rounded-2xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary italic font-serif text-2xl font-bold">
                  B
                </div>
              </div>
              <CardTitle className="text-2xl font-serif">
                {mode === "login" ? "Welcome back" : "Create an account"}
              </CardTitle>
              <CardDescription>
                {mode === "login" 
                  ? "Enter your credentials to access your account" 
                  : "Join the Beacon community today"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="rounded-xl h-11" onClick={handleAuth}>
                  <Chrome className="w-4 h-4 mr-2" /> Google
                </Button>
                <Button variant="outline" className="rounded-xl h-11" onClick={handleAuth}>
                  <Github className="w-4 h-4 mr-2" /> GitHub
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" className="rounded-xl h-11" />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" className="rounded-xl h-11" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" className="rounded-xl h-11" />
              </div>
              
              <Button 
                className="w-full h-11 rounded-xl group" 
                onClick={handleAuth}
              >
                {mode === "login" ? "Sign In" : "Sign Up"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 text-center">
              <p className="text-sm text-slate-500">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button 
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
              <p className="text-xs text-slate-400">
                By clicking continue, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
