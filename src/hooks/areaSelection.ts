import { alpha, lighten, useTheme } from "@mui/material";
import * as React from "react";
import { useCallback, useContext, useEffect, useRef } from "react";
import { FileManagerIndex } from "../component/FileManager/FileManager.tsx";
import { FmIndexContext } from "../component/FileManager/FmIndexContext.tsx";
import { clearSelected } from "../redux/fileManagerSlice.ts";
import { useAppDispatch, useAppSelector } from "../redux/hooks.ts";
import { selectionFromDragBox } from "../redux/thunks/file.ts";

const dataRectId = "data-rect-id";

interface Coordinates {
  x: number;
  y: number;
}

interface Candidates extends Coordinates {
  index: string;
  bottom: number;
  right: number;
}
interface DrawnArea {
  start: undefined | Coordinates;
  end: undefined | Coordinates;
  ctrlKey: boolean;
  metaKey: boolean;
}
interface UseAreaSelectionProps {
  container: React.RefObject<HTMLElement> | undefined;
}

// Smallest value >= target
function binarySearchTop(list: Candidates[][], target: number) {
  let start = 0;
  let end = list.length - 1;
  while (start <= end) {
    let mid = Math.floor((start + end) / 2);
    if (list[mid][0].y < target) start = mid + 1;
    else end = mid - 1;
  }
  return end;
}

// Largest value <= target
function binarySearchBottom(list: Candidates[][], target: number) {
  let start = 0;
  let end = list.length - 1;
  while (start <= end) {
    let mid = Math.floor((start + end) / 2);
    if (list[mid][0].y <= target) start = mid + 1;
    else end = mid - 1;
  }
  return end;
}

const boxNode = document.createElement("div");
boxNode.style.position = "fixed";
boxNode.style.borderRadius = "2px";
boxNode.style.pointerEvents = "none";

export function useAreaSelection(container: React.RefObject<HTMLElement>, explorerIndex: number, enabled: boolean) {
  const theme = useTheme();
  const fmIndex = useContext(FmIndexContext);
  const dispatch = useAppDispatch();
  const boxRef = React.useRef<HTMLDivElement>(boxNode);
  const fileList = useAppSelector((state) => state.fileManager[explorerIndex]?.list?.files);
  const boxElement = boxRef;
  const [mouseDown, setMouseDown] = React.useState<boolean>(false);
  const mouseMoving = useRef(false);
  const selectCandidates = useRef<Candidates[][]>([]);
  const elementsCache = useRef<string[] | null>(null);
  const [drawArea, setDrawArea] = React.useState<DrawnArea>({
    start: undefined,
    end: undefined,
    ctrlKey: false,
    metaKey: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!mouseMoving.current || fmIndex == FileManagerIndex.selector || !enabled) {
      return;
    }

    document.body.style.userSelect = "none";
    const containerElement = container.current;
    if (containerElement) {
      const pos = getPosition(containerElement, e);
      setDrawArea((prev) => ({
        ...prev,
        end: {
          ...pos,
        },
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
      }));

      const containerBox = containerElement.getBoundingClientRect();
      const containerHeight = containerBox.bottom - containerBox.top;
      const scrollMargin = containerHeight * 0.1;
      if (containerHeight - e.clientY + containerBox.top < scrollMargin) {
        containerElement.scrollTop += 10;
      } else if (e.clientY - containerBox.top < scrollMargin) {
        containerElement.scrollTop -= 10;
      }
    }
  };

  const getPosition = useCallback((containerElement: HTMLElement, e: React.MouseEvent<HTMLElement>): Coordinates => {
    const containerBox = containerElement.getBoundingClientRect();
    const y = containerElement.scrollTop + e.clientY - containerBox.top;
    const x = containerElement.scrollLeft + e.clientX - containerBox.left;
    return { x, y };
  }, []);

  const getDrawPosition = useCallback(
    (containerElement: HTMLElement, containerBox: DOMRect, cord: Coordinates): Coordinates => {
      const y = Math.min(
        Math.max(cord.y - containerElement.scrollTop + containerBox.top, containerBox.top),
        containerBox.bottom,
      );
      const x = Math.min(
        Math.max(cord.x - containerElement.scrollLeft + containerBox.left, containerBox.left),
        containerBox.right,
      );
      return { x, y };
    },
    [],
  );

  const updateCandidate = useCallback((containerElement: HTMLElement) => {
    // query all child with data-rect-id attr
    selectCandidates.current = [];
    const containerBox = containerElement.getBoundingClientRect();
    let currentY = 0;
    let currentRow: Candidates[] = [];
    containerElement.querySelectorAll("[data-rect-id]").forEach((el) => {
      if (el instanceof HTMLElement) {
        const rectId = el.getAttribute(dataRectId);
        const rect = el.getBoundingClientRect();
        if (rectId) {
          const candidate = {
            index: rectId,
            x: rect.x - containerBox.x,
            y: containerElement.scrollTop + rect.y - containerBox.y,
            bottom: containerElement.scrollTop + rect.bottom - containerBox.y,
            right: rect.right - containerBox.x,
          };
          if (candidate.y > currentY) {
            currentY = candidate.y;
            if (currentRow.length > 0) {
              selectCandidates.current.push(currentRow);
            }
            currentRow = [];
          }
          currentRow.push(candidate);
        }
      }
    });
    if (currentRow.length > 0) {
      selectCandidates.current.push(currentRow);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (e.button != 0 || !enabled) {
      return;
    }

    if (fmIndex == FileManagerIndex.selector) {
      return dispatch(clearSelected({ index: fmIndex, value: undefined }));
    }

    const containerElement = container.current;
    setMouseDown(true);
    mouseMoving.current = true;
    elementsCache.current = null;

    if (containerElement && containerElement.contains(e.target as HTMLElement)) {
      const pos = getPosition(containerElement, e);
      updateCandidate(containerElement);
      setDrawArea({
        start: {
          ...pos,
        },
        end: {
          ...pos,
        },
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
      });
    }
  };

  React.useEffect(() => {
    if (mouseMoving.current) {
      const containerElement = container.current;
      if (containerElement) {
        updateCandidate(containerElement);
      }
    }
  }, [fileList]);

  const handleMouseUp = (_e: React.MouseEvent<HTMLElement>) => {
    document.body.style.userSelect = "initial";
    setMouseDown(false);
    mouseMoving.current = false;
  };

  React.useEffect(() => {
    const { start, end } = drawArea;
    const containerElement = container.current;
    if (start && end && boxElement.current && containerElement) {
      const containerBox = containerElement.getBoundingClientRect();
      drawSelectionBox(
        boxElement.current,
        getDrawPosition(containerElement, containerBox, start),
        getDrawPosition(containerElement, containerBox, end),
      );

      const startX = Math.min(start.x, end.x);
      const startY = Math.min(start.y, end.y);
      const endX = Math.max(start.x, end.x);
      const endY = Math.max(start.y, end.y);

      // use binary search to find interest area in candidates
      const top = Math.max(0, binarySearchTop(selectCandidates.current, startY));
      const bottom = binarySearchBottom(selectCandidates.current, endY);

      const interestCandidates = selectCandidates.current.slice(top, bottom + 1);
      // find all candidates that are within the selection box
      const elements = interestCandidates.flat().filter((el) => {
        return !(el.x > endX || el.right < startX || el.y > endY || el.bottom < startY);
      });

      const activeElements = elements.map((el) => el.index);
      if (elementsCache.current != null) {
        // Compare if selection is changed
        if (
          elementsCache.current.length === activeElements.length &&
          elementsCache.current.every((el, index) => (activeElements[index] = el))
        ) {
          // No change
          return;
        }
      }

      elementsCache.current = activeElements;

      dispatch(
        selectionFromDragBox(
          0,
          elements.map((el) => el.index),
          drawArea.ctrlKey,
          drawArea.metaKey,
        ),
      );
    }
  }, [drawArea, boxElement, dispatch, container]);

  React.useEffect(() => {
    const containerElement = container.current;
    const selectionBoxElement = boxElement.current;
    if (containerElement && selectionBoxElement) {
      if (mouseDown) {
        if (!document.body.contains(selectionBoxElement)) {
          containerElement.appendChild(selectionBoxElement);
        }
      } else {
        if (containerElement.contains(selectionBoxElement)) {
          containerElement.removeChild(selectionBoxElement);
        }
      }
    }
  }, [mouseDown, container, boxElement]);

  useEffect(() => {
    const selectionBoxElement = boxElement.current;
    if (selectionBoxElement) {
      if (theme.palette.mode === "dark") {
        selectionBoxElement.style.background = alpha(lighten(theme.palette.primary.main, 0.3), 0.2);
      } else {
        selectionBoxElement.style.background = alpha(theme.palette.primary.main, 0.3);
      }
      selectionBoxElement.style.boxShadow = `inset 0 0 0 2px ${theme.palette.primary.light}`;
    }
  }, [theme, boxElement]);

  return [handleMouseDown, handleMouseUp, handleMouseMove] as const;
}

function drawSelectionBox(boxElement: HTMLElement, start: Coordinates, end: Coordinates): void {
  const b = boxElement;
  if (end.x > start.x) {
    b.style.left = start.x + "px";
    b.style.width = end.x - start.x + "px";
  } else {
    b.style.left = end.x + "px";
    b.style.width = start.x - end.x + "px";
  }

  if (end.y > start.y) {
    b.style.top = start.y + "px";
    b.style.height = end.y - start.y + "px";
  } else {
    b.style.top = end.y + "px";
    b.style.height = start.y - end.y + "px";
  }
}
