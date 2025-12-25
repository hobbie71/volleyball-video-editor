import { forwardRef } from "react";
import { cn } from "../../libs/cn";

interface PageProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const Page = forwardRef<HTMLElement, PageProps>(
  ({ children, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "min-w-screen min-h-screen",
          "bg-background text-text-primary",
          props.className
        )}
        {...props}>
        {children}
      </main>
    );
  }
);

Page.displayName = "Page";

export default Page;
