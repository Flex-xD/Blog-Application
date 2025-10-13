// src/components/ModalWrapper.tsx
import React from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

interface ModalWrapperProps {
    show: boolean;
    zIndex?: number;
    backdropVariants: Variants;
    children: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
    show,
    zIndex = 50,
    backdropVariants,
    children,
}) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="modal-backdrop"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={backdropVariants}
                    className={`fixed inset-0 flex items-center justify-center p-4`
                    }
                    style={{ zIndex }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ModalWrapper;
