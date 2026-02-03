
import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }) {
  return (
    <div className={cn("bg-white/5 border-white/10 shadow-2xl rounded-3xl p-6", className)} {...props} />
  );
}

export { Card }
