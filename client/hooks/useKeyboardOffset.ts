import { useEffect, useState } from "react";

export function useKeyboardOffset() {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        if (!window.visualViewport) return;

        const vv = window.visualViewport;

        const update = () => {
            const keyboardHeight =
                window.innerHeight - vv.height - vv.offsetTop;

            setOffset(keyboardHeight > 0 ? keyboardHeight : 0);
        };

        update();
        vv.addEventListener("resize", update);
        vv.addEventListener("scroll", update);

        return () => {
            vv.removeEventListener("resize", update);
            vv.removeEventListener("scroll", update);
        };
    }, []);

    return offset;
}