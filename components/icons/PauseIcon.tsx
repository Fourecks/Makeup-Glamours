import React from 'react';

interface PauseIconProps extends React.SVGProps<SVGSVGElement> {}

const PauseIcon: React.FC<PauseIconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-6-13.5v13.5" />
  </svg>
);

export default PauseIcon;
