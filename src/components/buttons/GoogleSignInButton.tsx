import { CSSProperties, FC, JSX, ReactNode, SVGProps, useState } from "react";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
type ButtonProps = {
  children: React.ReactNode;
};

const GoogleSignInButton: React.FC<ButtonProps> = ({ children }) => {
  const [isLoading, setLoading] = useState<boolean>(false);

  return (
    <Button
      disabled={process.env.NODE_ENV === "production" || isLoading}
      onClick={async () => {
        setLoading(true);
        await signIn("google", { callbackUrl: "/dashboard" });
        setLoading(false);
      }}
      className="flex items-center space-x-2 w-full"
      variant="outline"
    >
      <ChromeIcon className="h-4 w-4" />
      <span>Sign in with Google</span>
    </Button>
  );
};

function ChromeIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" x2="12" y1="8" y2="8" />
      <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
      <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
    </svg>
  );
}

export default GoogleSignInButton;
