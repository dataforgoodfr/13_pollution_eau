"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import useWindowSize from "@/hooks/useWindowSize";
import clsx from "clsx";

export const ResizableWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  const windowSize = useWindowSize();
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isResizing && windowSize.height && windowSize.width) {
      setDimensions({
        width: windowSize.width - 20,
        height: windowSize.height - 80,
      });
    }
  }, [windowSize.height, windowSize.width, isResizing]);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
          const boundingRect = containerRef.current?.getBoundingClientRect();
          if (boundingRect) {
            setDimensions({
              width: e.clientX - boundingRect.left,
              height: e.clientY - boundingRect.top,
            });
          }
        });
      }
    },
    [isResizing],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, isResizing]);

  return (
    <div
      className={clsx(
        "absolute top-2.5 left-2.5 p-2.5 bg-gray-100 bg-opacity-80 border border-gray-300 rounded",
        { "select-none": isResizing },
      )}
      ref={containerRef}
      style={dimensions}
    >
      {children}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-gray-500 cursor-se-resize"
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
};
