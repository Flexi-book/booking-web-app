import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

const AvatarBadge = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white dark:border-slate-900",
      className
    )}
    {...props}
  />
))
AvatarBadge.displayName = "AvatarBadge"

const AvatarGroup = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex -space-x-2 overflow-hidden", className)}
    {...props}
  >
    {children}
  </div>
))
AvatarGroup.displayName = "AvatarGroup"

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup }
