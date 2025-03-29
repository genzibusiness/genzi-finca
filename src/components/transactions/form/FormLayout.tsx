
import React from 'react';
import FormSection from './FormSection';

interface FormLayoutProps {
  children: React.ReactNode;
}

export const FormLayout: React.FC<FormLayoutProps> = ({ children }) => {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
};

interface FormRowProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({ 
  children, 
  columns = 3,
  className = ""
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3"
  };

  return (
    <FormSection className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </FormSection>
  );
};

export default FormLayout;
