/**
 * Ícone de robô customizado — usado no Navbar, Footer e MessageBubble
 * como identidade visual do Delivery AI Assistant.
 * A cor herda do parent via `currentColor`, então funciona em qualquer contexto.
 */

import type { SVGProps } from "react";

export function RobotIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Antena */}
      <line x1="12" y1="2" x2="12" y2="5" />
      <circle cx="12" cy="1.5" r="1" fill="currentColor" stroke="none" />

      {/* Cabeça */}
      <rect x="4" y="5" width="16" height="10" rx="2.5" />

      {/* Olhos */}
      <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />

      {/* Boca */}
      <path d="M9 13.5h6" strokeWidth="1.5" />

      {/* Pescoço */}
      <line x1="10" y1="15" x2="10" y2="17" />
      <line x1="14" y1="15" x2="14" y2="17" />

      {/* Corpo */}
      <rect x="6" y="17" width="12" height="5.5" rx="2" />

      {/* Botão central */}
      <circle cx="12" cy="19.75" r="1" fill="currentColor" stroke="none" />

      {/* Braços */}
      <path d="M6 18.5H3.5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1H6" />
      <path d="M18 18.5h2.5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H18" />
    </svg>
  );
}
