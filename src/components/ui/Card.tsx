import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
  as?: 'div' | 'section' | 'article';
}

export function Card({ children, interactive, className = '', as = 'div', ...rest }: CardProps) {
  const Tag = as;
  return (
    <Tag
      className={`rounded-2xl bg-white shadow-card ${
        interactive ? 'transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.99]' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
