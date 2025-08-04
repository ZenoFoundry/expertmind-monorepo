import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  scrollPercentage: number;
  isAtTop: boolean;
  isAtBottom: boolean;
  onScrollTo: (position: 'top' | 'bottom') => void;
  messagesCount: number;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  scrollPercentage,
  isAtTop,
  isAtBottom,
  onScrollTo,
  messagesCount
}) => {
  if (messagesCount === 0) return null;

  return (
    <div className="scroll-indicator">
      {/* Progress bar */}
      <div className="scroll-progress-track">
        <div 
          className="scroll-progress-bar"
          style={{ 
            height: `${scrollPercentage}%`,
            transition: 'height 0.1s ease'
          }}
        />
      </div>

      {/* Navigation buttons */}
      <div className="scroll-nav-buttons">
        {!isAtTop && (
          <button
            onClick={() => onScrollTo('top')}
            className="scroll-nav-btn scroll-nav-up"
            title="Go to top (Ctrl+Home)"
          >
            <ChevronUp size={14} />
          </button>
        )}
        
        {!isAtBottom && (
          <button
            onClick={() => onScrollTo('bottom')}
            className="scroll-nav-btn scroll-nav-down"
            title="Go to bottom (Ctrl+End)"
          >
            <ChevronDown size={14} />
          </button>
        )}
      </div>

      {/* Position info */}
      <div className="scroll-position-info">
        <span>{Math.round(scrollPercentage)}%</span>
      </div>
    </div>
  );
};

export default ScrollIndicator;