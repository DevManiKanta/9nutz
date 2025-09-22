
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { IMAGES } from "../../assets/IMAGES";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Wait for login to finish and return the user
      const user = await login(email.trim(), password);
      toast.success("Login successful");
      if (user) {
        setTimeout((
        )=>{navigate("/dashboard", { replace: true });},1000)
      } else {
        // Fallback: if login succeeded but user is not available — still try
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Toaster position="top-right" />
      <div
        className="min-h-screen flex items-center justify-end bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${IMAGES.Bg_Image || "/images/retail-bg.jpg"})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 w-full max-w-lg h-screen flex items-center p-6">
          <Card className="w-full h-[650px]  backdrop-blur-md bg-white flex flex-col justify-center">
            <CardHeader className="text-center space-y-6">
              <img src={IMAGES.Nutz} alt="Retail Logo" className="mx-auto w-25 h-20"/>
              <div className="space-y-2">
                {/* <CardTitle className="text-2xl font-bold">BLK BUSINESS SOLUTIONS Pvt Ltd</CardTitle> */}
                {/* <CardTitle className="text-xl font-bold">Welcome Back</CardTitle> */}
              </div>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col justify-center">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 pr-10" />
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="default" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" style={{ color: "black" }} />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* <p className="text-sm text-center mt-2">
                <Link to="/forgot-password" className="text-primary hover:underline">Forgot Password</Link>
              </p> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

