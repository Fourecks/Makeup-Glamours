import React, { useState, useRef, useEffect } from 'react';
import PencilIcon from './icons/PencilIcon';

interface EditableProps {
  as?: React.ElementType;
  isAdmin: boolean;
  value: string;
  onSave: (value: string) => void;
  className?: string;
  multiline?: boolean;
}

const Editable: React.FC<EditableProps> = ({ as: Component = 'div', isAdmin, value, onSave, className, multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleSave = () => {
    if (currentValue.trim() !== value.trim()) {
      onSave(currentValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (!isAdmin) {
    return <Component className={className}>{value}</Component>;
  }

  if (isEditing) {
      if (multiline) {
          return (
              <textarea
                ref={inputRef}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full bg-white/90 border border-brand-pink rounded-md p-2 text-base text-gray-900"
                rows={4}
              />
          )
      }
    return (
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full bg-white/90 border border-brand-pink rounded-md p-1 text-gray-900"
      />
    );
  }

  return (
    <Component
      onClick={() => setIsEditing(true)}
      className={`relative group cursor-pointer hover:outline hover:outline-2 hover:outline-dashed hover:outline-brand-pink p-1 rounded-sm transition-all ${className}`}
    >
      {value}
      <PencilIcon className="h-4 w-4 absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-full text-brand-pink opacity-0 group-hover:opacity-100 transition-opacity" />
    </Component>
  );
};

export default Editable;
