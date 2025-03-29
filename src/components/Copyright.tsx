
import React from 'react';

const Copyright = () => {
  const year = new Date().getFullYear();
  
  return (
    <div className="text-xs text-muted-foreground p-2 absolute bottom-0 left-0">
      © {year} Genzi Finca. All rights reserved.
    </div>
  );
};

export default Copyright;
