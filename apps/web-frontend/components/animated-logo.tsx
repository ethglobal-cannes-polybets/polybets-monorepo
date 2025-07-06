"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function AnimatedLogo({ className, size = "md" }: AnimatedLogoProps) {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation on mount with a small delay
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const sizeClasses = {
    sm: {
      container: "w-20 h-3",
      circle: "w-3 h-3",
      logo: "left-4",
      logoExpanded: "left-8",
      svg: "h-2"
    },
    md: {
      container: "w-[115px] h-5",
      circle: "w-[18px] h-[18px]",
      logo: "left-6",
      logoExpanded: "left-11",
      svg: "h-3"
    },
    lg: {
      container: "w-[140px] h-6",
      circle: "w-5 h-5",
      logo: "left-7",
      logoExpanded: "left-14",
      svg: "h-4"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-transform duration-100 ease-out hover:scale-105 active:scale-98",
        currentSize.container,
        className
      )}
    >
      {/* Backdrop glow effect */}
      <div className="absolute inset-0 -m-2 rounded-lg bg-white/5 backdrop-blur-sm opacity-0 transition-opacity duration-300 hover:opacity-100" />
      
      {/* Circle trail */}
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className={cn(
            "absolute border border-black rounded-full bg-transparent transition-all duration-300 ease-out",
            "top-1/2 -translate-y-1/2", // Center vertically
            currentSize.circle,
            index < 5 ? "opacity-0 scale-75" : "opacity-100 scale-100 bg-black transition-all duration-700",
            // Position circles
            index === 0 && "left-0",
            index === 1 && "left-1",
            index === 2 && "left-2",
            index === 3 && "left-3",
            index === 4 && "left-4",
            index === 5 && "left-0",
            // Animated positions for the black circle
            index === 5 && isAnimated && "left-5",
            // Reveal animation for trail circles
            index < 5 && isAnimated && "opacity-100 scale-100"
          )}
          style={{
            // Add specific transition delays for the trail effect
            transitionDelay: index < 5 && isAnimated ? `${200 + index * 150}ms` : "0ms",
            transitionTimingFunction: index === 5 ? "cubic-bezier(0.4, 0, 0.2, 1)" : "ease-out"
          }}
        />
      ))}
      
      {/* Logo */}
      <div
        className={cn(
          "absolute transition-all duration-700 opacity-90",
          "top-1/2 -translate-y-1/2", // Center vertically
          currentSize.logo,
          isAnimated && currentSize.logoExpanded
        )}
        style={{
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <svg
          className={cn("w-auto", currentSize.svg)}
          width="67"
          height="13"
          viewBox="0 0 67 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.264 7.776V12H0.152V0.799999H4.536C5.112 0.799999 5.61333 0.895999 6.04 1.088C6.46667 1.26933 6.81867 1.51467 7.096 1.824C7.384 2.12267 7.59733 2.46933 7.736 2.864C7.88533 3.248 7.96 3.64267 7.96 4.048V4.432C7.96 4.848 7.88533 5.25867 7.736 5.664C7.59733 6.05867 7.384 6.416 7.096 6.736C6.81867 7.04533 6.46667 7.296 6.04 7.488C5.61333 7.68 5.112 7.776 4.536 7.776H2.264ZM2.264 5.76H4.328C4.79733 5.76 5.16533 5.632 5.432 5.376C5.70933 5.12 5.848 4.78933 5.848 4.384V4.192C5.848 3.78667 5.70933 3.456 5.432 3.2C5.16533 2.944 4.79733 2.816 4.328 2.816H2.264V5.76ZM9.56488 5.152C9.56488 3.70133 9.92754 2.576 10.6529 1.776C11.3889 0.975999 12.4022 0.575999 13.6929 0.575999C14.9835 0.575999 15.9915 0.975999 16.7169 1.776C17.4529 2.576 17.8209 3.70133 17.8209 5.152V7.648C17.8209 9.14133 17.4529 10.2773 16.7169 11.056C15.9915 11.8347 14.9835 12.224 13.6929 12.224C12.4022 12.224 11.3889 11.8347 10.6529 11.056C9.92754 10.2773 9.56488 9.14133 9.56488 7.648V5.152ZM13.6929 10.304C14.0769 10.304 14.3969 10.2453 14.6529 10.128C14.9089 10 15.1169 9.824 15.2769 9.6C15.4369 9.376 15.5489 9.10933 15.6129 8.8C15.6769 8.49067 15.7089 8.14933 15.7089 7.776V5.024C15.7089 4.672 15.6715 4.34133 15.5969 4.032C15.5222 3.72267 15.4049 3.456 15.2449 3.232C15.0849 3.008 14.8769 2.832 14.6209 2.704C14.3649 2.56533 14.0555 2.496 13.6929 2.496C13.3302 2.496 13.0209 2.56533 12.7649 2.704C12.5089 2.832 12.3009 3.008 12.1409 3.232C11.9809 3.456 11.8635 3.72267 11.7889 4.032C11.7142 4.34133 11.6769 4.672 11.6769 5.024V7.776C11.6769 8.14933 11.7089 8.49067 11.7729 8.8C11.8369 9.10933 11.9489 9.376 12.1089 9.6C12.2689 9.824 12.4769 10 12.7329 10.128C12.9889 10.2453 13.3089 10.304 13.6929 10.304ZM19.9058 0.799999H22.0178V9.984H27.1058V12H19.9058V0.799999ZM32.2306 8.064H31.7506L28.5346 0.799999H30.8386L33.1426 6.144H33.4306L35.7346 0.799999H38.0386L34.8226 8.064H34.3426V12H32.2306V8.064ZM38.9235 9.984H39.9795V2.816H38.9235V0.799999H43.8355C44.3688 0.799999 44.8382 0.874666 45.2435 1.024C45.6595 1.17333 46.0062 1.376 46.2835 1.632C46.5715 1.888 46.7848 2.19733 46.9235 2.56C47.0728 2.912 47.1475 3.296 47.1475 3.712V3.904C47.1475 4.544 46.9662 5.056 46.6035 5.44C46.2515 5.824 45.8035 6.09067 45.2595 6.24V6.528C45.8035 6.67733 46.2515 6.94933 46.6035 7.344C46.9662 7.728 47.1475 8.24 47.1475 8.88V9.072C47.1475 9.488 47.0728 9.87733 46.9235 10.24C46.7848 10.592 46.5715 10.9013 46.2835 11.168C46.0062 11.424 45.6595 11.6267 45.2435 11.776C44.8382 11.9253 44.3688 12 43.8355 12H38.9235V9.984ZM42.0915 9.984H43.6275C44.0755 9.984 44.4382 9.888 44.7155 9.696C44.9928 9.504 45.1315 9.184 45.1315 8.736V8.64C45.1315 8.192 44.9928 7.872 44.7155 7.68C44.4382 7.488 44.0755 7.392 43.6275 7.392H42.0915V9.984ZM42.0915 5.376H43.6275C44.0755 5.376 44.4382 5.28533 44.7155 5.104C44.9928 4.912 45.1315 4.592 45.1315 4.144V4.048C45.1315 3.6 44.9928 3.28533 44.7155 3.104C44.4382 2.912 44.0755 2.816 43.6275 2.816H42.0915V5.376ZM49.2964 0.799999H56.3684V2.816H51.4084V5.376H56.1764V7.392H51.4084V9.984H56.5604V12H49.2964V0.799999ZM58.6453 0.799999H66.7093V2.816H63.7333V12H61.6213V2.816H58.6453V0.799999Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
} 