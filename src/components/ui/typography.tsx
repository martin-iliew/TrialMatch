import { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  className?: string;
}

/* ── Display / Hero ── */

const LandingHero = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h1 className={cn("landing-hero", className)} {...props}>
      {children}
    </h1>
  );
};

const DisplayPage = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h1 className={cn("display-page", className)} {...props}>
      {children}
    </h1>
  );
};

const TitlePage = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h2 className={cn("title-page", className)} {...props}>
      {children}
    </h2>
  );
};

/* ── Headings ── */

const Heading1 = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h1 className={cn("heading-1", className)} {...props}>
      {children}
    </h1>
  );
};

const Heading2 = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h2 className={cn("heading-2", className)} {...props}>
      {children}
    </h2>
  );
};

const Heading3 = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h3 className={cn("heading-3", className)} {...props}>
      {children}
    </h3>
  );
};

const Heading4 = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h4 className={cn("heading-4", className)} {...props}>
      {children}
    </h4>
  );
};

const Heading5 = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h5 className={cn("heading-5", className)} {...props}>
      {children}
    </h5>
  );
};

const Heading6 = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h6 className={cn("heading-6", className)} {...props}>
      {children}
    </h6>
  );
};

const Heading7 = ({ children, className, ...props }: TypographyProps) => {
  return (
    <span className={cn("heading-7", className)} {...props}>
      {children}
    </span>
  );
};

const Heading8 = ({ children, className, ...props }: TypographyProps) => {
  return (
    <span className={cn("heading-8", className)} {...props}>
      {children}
    </span>
  );
};

const Heading9 = ({ children, className, ...props }: TypographyProps) => {
  return (
    <span className={cn("heading-9", className)} {...props}>
      {children}
    </span>
  );
};

/* ── Body / Text ── */

const Body = ({ children, className, ...props }: TypographyProps) => {
  return (
    <p className={cn("body", className)} {...props}>
      {children}
    </p>
  );
};

const BodySmall = ({ children, className, ...props }: TypographyProps) => {
  return (
    <p className={cn("body-small", className)} {...props}>
      {children}
    </p>
  );
};

const Caption = ({ children, className, ...props }: TypographyProps) => {
  return (
    <p className={cn("caption", className)} {...props}>
      {children}
    </p>
  );
};

const Small = ({ children, className, ...props }: TypographyProps) => {
  return (
    <span className={cn("small", className)} {...props}>
      {children}
    </span>
  );
};

const Label = ({ children, className, ...props }: TypographyProps) => {
  return (
    <label className={cn("label", className)} {...props}>
      {children}
    </label>
  );
};

/* ── CTA ── */

const CTA = ({ children, className, ...props }: TypographyProps) => {
  return (
    <span className={cn("cta", className)} {...props}>
      {children}
    </span>
  );
};

const CTASmall = ({ children, className, ...props }: TypographyProps) => {
  return (
    <span className={cn("cta-sm", className)} {...props}>
      {children}
    </span>
  );
};

/* ── Code ── */

const CodeSnippet = ({ children, className, ...props }: TypographyProps) => {
  return (
    <code className={cn("code", className)} {...props}>
      {children}
    </code>
  );
};

/* ── Aliases (back-compat) ── */
const SectionTitle = Heading3;
const SubTitlePage = Heading5;
const BodyBase = Body;
const Title = Heading3;

export {
  LandingHero,
  DisplayPage,
  TitlePage,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Heading7,
  Heading8,
  Heading9,
  Body,
  BodySmall,
  Caption,
  Small,
  Label,
  CTA,
  CTASmall,
  CodeSnippet,
  SectionTitle,
  SubTitlePage,
  BodyBase,
  Title,
};
