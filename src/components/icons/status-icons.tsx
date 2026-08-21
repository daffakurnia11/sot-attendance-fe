import type { SVGProps } from "react";

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" height="1em" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2m-11 0h12a1 1 0 0 1 1 1v9H5v-9a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function VerifiedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" height="1em" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.7 7.7-5.5 5.5a1 1 0 0 1-1.4 0l-2.5-2.5 1.4-1.4 1.8 1.8 4.8-4.8 1.4 1.4Z" />
    </svg>
  );
}
