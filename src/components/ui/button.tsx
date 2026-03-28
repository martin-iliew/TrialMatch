"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cta-sm group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding whitespace-nowrap transition-all duration-150 ease-out outline-none select-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-status-danger aria-invalid:ring-3 aria-invalid:ring-status-danger/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand text-on-brand hover:bg-brand-hover",
        outline:
          "border-primary bg-default hover:bg-subtle hover:text-primary aria-expanded:bg-subtle aria-expanded:text-primary",
        secondary:
          "bg-surface-level-2 text-primary hover:bg-surface-level-3 aria-expanded:bg-surface-level-2 aria-expanded:text-primary",
        ghost:
          "hover:bg-subtle hover:text-primary aria-expanded:bg-subtle aria-expanded:text-primary",
        destructive:
          "bg-surface-status-danger text-icon-status-danger hover:bg-surface-status-danger focus-visible:border-status-danger focus-visible:ring-status-danger/20",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        xs: "h-7 gap-1 rounded-[min(var(--radius-md),10px)] px-3 text-[length:var(--text-xs)] leading-[var(--leading-xs)] tracking-[var(--tracking-xs)] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 rounded-[min(var(--radius-md),12px)] px-4 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-1.5 px-8 has-data-[icon=inline-end]:pr-7 has-data-[icon=inline-start]:pl-7",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
