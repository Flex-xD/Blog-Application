import type { Variants } from "framer-motion";

export const modalVariants = {
    open: {
        opacity: 1,
        scale: 1,
        transition: { type: "tween", duration: 0.2, ease: "easeInOut" },
    },
    closed: {
        opacity: 0,
        scale: 0.9,
        transition: { type: "tween", duration: 0.15, ease: "easeInOut" },
    },
} satisfies Variants; 

export const backdropVariants = {
    open: { opacity: 1, transition: { duration: 0.2 } },
    closed: { opacity: 0, transition: { duration: 0.15 } },
};