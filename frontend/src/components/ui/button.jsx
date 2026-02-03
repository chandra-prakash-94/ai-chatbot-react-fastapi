
import * as React from "react"
import { cn } from "@/lib/utils"

function Button({ className, ...props }) {
  return (
    <button
      className={cn("bg-blue-600 text-white rounded px-4 py-2", className)}
      {...props}
    />
  );
}

export { Button }
