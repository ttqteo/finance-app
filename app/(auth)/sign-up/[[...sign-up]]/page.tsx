import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";

const SignUpPage = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="h-full lg:flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 pt-6">
          <h1 className="font-bold text-3xl text-[#2E2A47]">Welcome Back!</h1>
        </div>
        <p className="text-base text-[#7E8CA0]">
          Login or Create account to get back to your dashboard!
        </p>
        <div className="flex items-center justify-center mt-8">
          <ClerkLoaded>
            <SignUp path="/sign-up" />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2Icon className="animate-spin to-muted-foreground" />
          </ClerkLoading>
        </div>
      </div>
      <div className="h-full bg-black hidden lg:flex items-center justify-center">
        <Image src="/logo.png" height={100} width={100} alt="logo" />
      </div>
    </div>
  );
};

export default SignUpPage;
