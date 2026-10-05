import type { SVGProps } from "react";
export default function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 11.5a9 9 0 0 1-9 9 9 9 0 0 1-4.1-1L3 21l1.5-4.7A9 9 0 1 1 21 11.5Z" />
      <path d="m8.1 7.2 1.6-.2 1 2.4-1.1 1a8 8 0 0 0 3 3l1-1.1 2.4 1-.2 1.6c-.2 1.2-1.4 1.9-2.5 1.4a12 12 0 0 1-6.6-6.6c-.5-1.1.2-2.3 1.4-2.5Z" />
    </svg>
  );
}
