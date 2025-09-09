import React from 'react';

const WavyDivider: React.FC = () => (
    <div className="w-full h-20 bg-brand-pink" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}>
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-50 fill-current">
            <path d="M1440 110.1C1204 110.1 965.7 35 720 35c-247.4 0-484.3 75.1-720 75.1V0h1440v110.1z" />
        </svg>
    </div>
);

export default WavyDivider;