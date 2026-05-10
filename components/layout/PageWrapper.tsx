interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <main
      className={`flex-1 overflow-y-auto pt-14 pb-20 px-4 max-w-lg mx-auto w-full ${className}`}
    >
      {children}
    </main>
  );
}
