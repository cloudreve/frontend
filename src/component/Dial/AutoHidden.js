import React, { useEffect, useState } from "react";
import Zoom from "@material-ui/core/Zoom";

function AutoHidden({ children, enable, hide = false, element = null }) {
    const [hidden, setHidden] = useState(false);
    let prev = window.scrollY;
    let lastUpdate = window.scrollY;
    const show = 50;

    useEffect(() => {
        const handleNavigation = (e) => {
            const window = e.currentTarget;
            const current = element ? element.scrollTop : window.scrollY;

            if (prev > current) {
                if (lastUpdate - current > show) {
                    lastUpdate = current;
                    setHidden(false);
                }
            } else if (prev < current) {
                if (current - lastUpdate > show) {
                    lastUpdate = current;
                    setHidden(true);
                }
            }
            prev = current;
        };
        if (enable) {
            const target = element ? element : window;
            target.addEventListener("scroll", (e) => handleNavigation(e));
        }
        // eslint-disable-next-line
    }, [enable]);

    return <Zoom in={!hidden && !hide}>{children}</Zoom>;
}

export default AutoHidden;
