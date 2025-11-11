import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
  // Add onClick here, it's needed for chaining when asChild is true.
  // Extending ButtonHTMLAttributes already includes onClick, but this explicit declaration helps for cloning.
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  inset?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

interface DropdownMenuContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>; // Corrected type to accept functional updates
  triggerRef: React.RefObject<HTMLElement>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined);

// Helper types for cloning elements that accept refs
type ClonedTriggerProps = DropdownMenuTriggerProps & { ref?: React.Ref<HTMLElement> };
type ClonedContentProps = DropdownMenuContentProps & { ref?: React.Ref<HTMLDivElement> };

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
        contentRef.current && !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            if (child.type === DropdownMenuTrigger) {
              return React.cloneElement(child as React.ReactElement<ClonedTriggerProps>, {
                ref: triggerRef,
                // Chain original onClick with the dropdown toggle
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                  (child.props as DropdownMenuTriggerProps).onClick?.(e);
                  setOpen(prev => !prev);
                }
              });
            }
            if (child.type === DropdownMenuContent) {
              return React.cloneElement(child as React.ReactElement<ClonedContentProps>, {
                ref: contentRef
              });
            }
          }
          return child;
        })}
      </div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef<HTMLElement, DropdownMenuTriggerProps>(
  ({ children, asChild, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    if (!context) throw new Error('DropdownMenuTrigger must be used within a DropdownMenu');

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      // Chain the passed onClick prop if it exists
      onClick?.(e);
      context.setOpen(prev => !prev);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        // Pass the ref received by forwardRef to the child
        // Use `ref` directly as a prop, and cast the props object to `any` if TypeScript complains
        // This is a common workaround for `ref` not being a standard prop in `React.cloneElement`'s prop type
        ref: ref,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          (children.props as DropdownMenuTriggerProps).onClick?.(e); // Chain original onClick
          handleClick(e); // Our handler
        },
        ...props,
      } as any); // Cast to any to bypass ref prop type error
    }

    // Default to a button if not asChild or children is not a valid element
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, children, align = 'center', ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    if (!context) throw new Error('DropdownMenuContent must be used within a DropdownMenu');

    if (!context.open) return null;

    const alignClasses = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 mt-2 w-full sm:w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, disabled, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    if (!context) throw new Error('DropdownMenuItem must be used within a DropdownMenu');

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        onClick?.(e);
        context.setOpen(false); // Close menu on item click
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          inset && 'pl-8',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={handleClick}
        role="menuitem"
        aria-disabled={disabled}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};