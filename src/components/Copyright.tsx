
import React from 'react';

const Copyright = () => {
  const year = new Date().getFullYear();
  
  return (
    <div className="text-xs text-muted-foreground p-4 text-center border-t mt-auto">
      © {year} Genzi Finca. All rights reserved. Powered by <a href="https://genzi.ai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">genzi.ai</a>
    </div>
  );
};

export default Copyright;
