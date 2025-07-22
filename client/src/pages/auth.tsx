import { useState } from "react";
import { GraduationCap, Book, Users, TrendingUp } from "lucide-react";
import { AuthFormWrapper } from "@/components/auth/AuthFormWrapper";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { OTPVerificationForm } from "@/components/auth/OTPVerificationForm";

type AuthView = "login" | "signup" | "forgotPassword" | "otpVerification";

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [fromSignup, setFromSignup] = useState(false);

  const switchToOTP = (email: string, isFromSignup = false) => {
    setVerificationEmail(email);
    setFromSignup(isFromSignup);
    setCurrentView("otpVerification");
  };

  const renderCurrentForm = () => {
    switch (currentView) {
      case "signup":
        return (
          <SignupForm
            onSwitchToLogin={() => setCurrentView("login")}
            onSwitchToOTP={(email) => switchToOTP(email, true)}
          />
        );
      case "forgotPassword":
        return (
          <ForgotPasswordForm
            onSwitchToLogin={() => setCurrentView("login")}
            onSwitchToOTP={switchToOTP}
          />
        );
      case "otpVerification":
        return (
          <OTPVerificationForm
            email={verificationEmail}
            fromSignup={fromSignup}
            onSwitchToLogin={() => setCurrentView("login")}
            onSwitchToSignup={() => setCurrentView("signup")}
            onSwitchToForgotPassword={() => setCurrentView("forgotPassword")}
          />
        );
      default:
        return (
          <LoginForm
            onSwitchToSignup={() => setCurrentView("signup")}
            onSwitchToForgotPassword={() => setCurrentView("forgotPassword")}
            onSwitchToOTP={switchToOTP}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-700 to-cyan-500 flex">
      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="flex flex-col justify-center items-start p-12 z-10 relative">
          {/* VU Branding */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 mr-4">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold">VU Portal</h1>
                <p className="text-white/80 text-sm">Virtual University of Pakistan</p>
              </div>
            </div>
            <h2 className="text-white text-3xl font-bold mb-4">Welcome to Student Portal</h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Access your personalized dashboard, course materials, and join our vibrant academic community.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4 w-full max-w-md">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <Book className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Academic Resources</h3>
                  <p className="text-white/70 text-sm">Access syllabus, lectures, and past papers anytime</p>
                </div>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Collaborative Learning</h3>
                  <p className="text-white/70 text-sm">Connect with peers and instructors</p>
                </div>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Progress Tracking</h3>
                  <p className="text-white/70 text-sm">Monitor your academic performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48"></div>
      </div>

      {/* Right Side - Authentication Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <AuthFormWrapper>
          {renderCurrentForm()}
        </AuthFormWrapper>
      </div>
    </div>
  );
}
