import { useRef } from "react";
import { throttle } from "lodash";

const useDragScrolling = () => {
    const isScrolling = useRef(false);
    const target = document.querySelector("#explorer-container");

    const goDown = () => {
        target.scrollTop += 10;

        const { offsetHeight, scrollTop, scrollHeight } = target;
        const isScrollEnd = offsetHeight + scrollTop >= scrollHeight;

        if (isScrolling.current && !isScrollEnd) {
            window.requestAnimationFrame(goDown);
        }
    };

    const goUp = () => {
        target.scrollTop -= 10;

        if (isScrolling.current && target.scrollTop > 0) {
            window.requestAnimationFrame(goUp);
        }
    };

    const onDragOver = (event) => {
        const isMouseOnTop = event.clientY < 100;
        const isMouseOnDown = window.innerHeight - event.clientY < 100;

        if (!isScrolling.current && (isMouseOnTop || isMouseOnDown)) {
            isScrolling.current = true;

            if (isMouseOnTop) {
                window.requestAnimationFrame(goUp);
            }

            if (isMouseOnDown) {
                window.requestAnimationFrame(goDown);
            }
        } else if (!isMouseOnTop && !isMouseOnDown) {
            isScrolling.current = false;
        }
    };

    const throttleOnDragOver = throttle(onDragOver, 300);

    const addEventListenerForWindow = () => {
        window.addEventListener("dragover", throttleOnDragOver, false);
    };

    const removeEventListenerForWindow = () => {
        window.removeEventListener("dragover", throttleOnDragOver, false);
        isScrolling.current = false;
    };

    return {
        addEventListenerForWindow,
        removeEventListenerForWindow,
    };
};

export default useDragScrolling;
