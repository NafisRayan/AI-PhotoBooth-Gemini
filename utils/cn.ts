// A basic utility function for conditionally joining class names.
// In a full shadcn/ui setup, this would typically use 'clsx' and 'tailwind-merge'.
// For this environment, we'll provide a simplified version.
export function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(' ');
}