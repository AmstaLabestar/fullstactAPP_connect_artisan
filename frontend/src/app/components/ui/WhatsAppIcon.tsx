import React from 'react';

type WhatsAppIconProps = React.SVGProps<SVGSVGElement>;

export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({ className, ...props }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M13.6 2.3A7.9 7.9 0 0 0 6.8 14l-.8 2.4 2.4-.6a7.9 7.9 0 1 0 5.2-13.5Zm0 12.9a6.6 6.6 0 0 1-3.4-.9l-.2-.1-1.4.4.4-1.4-.1-.2a6.6 6.6 0 1 1 4.8 2.2Z" />
      <path d="M11.8 9.9c-.2-.1-1-.5-1.1-.5-.1-.1-.2-.1-.3.1-.1.2-.4.5-.5.6-.1.1-.2.1-.3 0-.2-.1-.7-.3-1.3-.9-.5-.4-.8-.9-.9-1.1-.1-.1 0-.2.1-.3l.2-.3.2-.3c.1-.1 0-.2 0-.3l-.5-1.1c-.1-.3-.2-.2-.3-.2h-.3c-.1 0-.3.1-.4.2-.1.2-.6.6-.6 1.4 0 .8.6 1.6.7 1.7.1.1 1.2 1.9 2.9 2.6.4.2.7.3.9.4.4.1.7.1 1 .1.3 0 1-.4 1.1-.8.1-.4.1-.7.1-.8-.1 0-.2-.1-.3-.1Z" />
    </svg>
  );
};

