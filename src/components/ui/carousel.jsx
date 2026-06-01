import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const CarouselContext = React.createContext(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error("useCarousel must be used within <Carousel />")
  return context
}

const Carousel = React.forwardRef(({ orientation = "horizontal", opts, plugins, className, setApi, children, ...props }, ref) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ ...opts, axis: orientation === "horizontal" ? "x" : "y" }, plugins)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(true)

  const onSelect = React.useCallback((api) => {
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  React.useEffect(() => {
    if (!emblaApi) return
    setApi?.(emblaApi)
    onSelect(emblaApi)
    emblaApi.on("reInit", onSelect).on("select", onSelect)
  }, [emblaApi, setApi, onSelect])

  return (
    <CarouselContext.Provider value={{ emblaApi, canScrollPrev, canScrollNext, orientation }}>
      <div ref={ref} className={cn("relative", className)} role="region" aria-roledescription="carousel" {...props}>
        <div ref={emblaRef} className="overflow-hidden">
          {children}
        </div>
      </div>
    </CarouselContext.Provider>
  )
})
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()
  return (
    <div ref={ref} className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)} {...props} />
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()
  return (
    <div ref={ref} role="group" aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
      {...props} />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef(({ className, ...props }, ref) => {
  const { emblaApi, canScrollPrev } = useCarousel()
  return (
    <Button ref={ref} variant="outline" size="icon"
      className={cn("absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg bg-white/90 backdrop-blur-sm border-white/50 hover:bg-white", className)}
      disabled={!canScrollPrev}
      onClick={() => emblaApi?.scrollPrev()}
      {...props}>
      <ArrowLeft className="h-4 w-4" />
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef(({ className, ...props }, ref) => {
  const { emblaApi, canScrollNext } = useCarousel()
  return (
    <Button ref={ref} variant="outline" size="icon"
      className={cn("absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg bg-white/90 backdrop-blur-sm border-white/50 hover:bg-white", className)}
      disabled={!canScrollNext}
      onClick={() => emblaApi?.scrollNext()}
      {...props}>
      <ArrowRight className="h-4 w-4" />
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }
