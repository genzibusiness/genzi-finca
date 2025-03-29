
import React from 'react';

interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children,
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`} data-testid="form-section">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
