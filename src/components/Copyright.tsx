
import React from 'react';

const Copyright = () => {
  const year = new Date().getFullYear();
  
  return (
    <div className="text-xs text-muted-foreground p-4 text-center border-t mt-auto">
      © {year} Genzi Finca. All rights reserved. Powered by Zimba 1.0
    </div>
  );
};

export default Copyright;
