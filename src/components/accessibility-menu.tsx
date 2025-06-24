
"use client";

import { useState, useEffect } from "react";
import { Accessibility, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const FONT_STEP = 2; // Font size change in pixels
const INITIAL_FONT_SIZE = 16; // Corresponds to Tailwind's `text-base`

export function AccessibilityMenu() {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(INITIAL_FONT_SIZE);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    // Check for saved preferences in localStorage
    const savedContrast = localStorage.getItem("high-contrast-mode");
    if (savedContrast) {
      const isEnabled = JSON.parse(savedContrast);
      setIsHighContrast(isEnabled);
      document.documentElement.classList.toggle("high-contrast", isEnabled);
    }

    const savedFontSize = localStorage.getItem("font-size");
    if (savedFontSize) {
      const size = parseInt(savedFontSize, 10);
      setFontSize(size);
      document.documentElement.style.fontSize = `${size}px`;
    }
  }, [isMounted]);

  const toggleHighContrast = (checked: boolean) => {
    setIsHighContrast(checked);
    document.documentElement.classList.toggle("high-contrast", checked);
    localStorage.setItem("high-contrast-mode", JSON.stringify(checked));
  };

  const changeFontSize = (direction: "increase" | "decrease") => {
    setFontSize((prevSize) => {
      const newSize =
        direction === "increase"
          ? prevSize + FONT_STEP
          : prevSize - FONT_STEP;
      // Clamp font size between reasonable limits
      const clampedSize = Math.max(12, Math.min(24, newSize));
      document.documentElement.style.fontSize = `${clampedSize}px`;
      localStorage.setItem("font-size", clampedSize.toString());
      return clampedSize;
    });
  };

  const resetAccessibility = () => {
    // Reset high contrast
    setIsHighContrast(false);
    document.documentElement.classList.remove("high-contrast");
    localStorage.removeItem("high-contrast-mode");

    // Reset font size
    setFontSize(INITIAL_FONT_SIZE);
    document.documentElement.style.fontSize = ""; // Use '' to revert to stylesheet default
    localStorage.removeItem("font-size");
  };

  if (!isMounted) {
    return null; // Don't render anything on the server to avoid hydration mismatches
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
          aria-label="Open accessibility menu"
        >
          <Accessibility className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Accessibility</h4>
            <p className="text-sm text-muted-foreground">
              Adjust settings for a better experience.
            </p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast-mode">High Contrast</Label>
            <Switch
              id="high-contrast-mode"
              checked={isHighContrast}
              onCheckedChange={toggleHighContrast}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="font-size">Font Size</Label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => changeFontSize("decrease")}
                aria-label="Decrease font size"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm font-bold tabular-nums">
                {Math.round((fontSize / INITIAL_FONT_SIZE) * 100)}%
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => changeFontSize("increase")}
                aria-label="Increase font size"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={resetAccessibility}
            className="w-full justify-start gap-2 px-2 font-normal"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
