import React from "react";
import { cn } from "../../lib/utils";

export default function Container({ children, className }) {
  return (
    <div className={cn("w-full max-w-7xl mx-auto px-4 md:px-6", className)}>
      {children}
    </div>
  );
}
