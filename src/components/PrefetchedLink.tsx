import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

interface PrefetchedLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
}

/**
 * Enhanced Link component with automatic prefetching
 * Prefetches the page when the link is hovered or focused
 * This significantly improves perceived navigation speed
 */
export default function PrefetchedLink({
  href,
  children,
  className,
  prefetch = true,
  ...props
}: PrefetchedLinkProps) {
  return (
    <Link href={href} className={className} prefetch={prefetch} {...props}>
      {children}
    </Link>
  );
}
