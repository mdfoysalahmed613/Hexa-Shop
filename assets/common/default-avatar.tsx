import * as React from "react";

interface DefaultAvatarProps extends React.SVGProps<SVGSVGElement> {
   size?: number;
}

export function DefaultAvatar({ size = 96, ...props }: DefaultAvatarProps) {
   return (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         width={size}
         height={size}
         {...props}
      >
         <circle cx="12" cy="12" r="12" fill="#E0E0E0" />
         <circle cx="12" cy="8" r="4" fill="#757575" />
         <path
            d="M4 18.5C4 16.5 7 15 12 15C17 15 20 16.5 20 18.5V20H4V18.5Z"
            fill="#757575"
         />
      </svg>
   );
}
