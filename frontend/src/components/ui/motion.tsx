import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    delay?: number;
    duration?: number;
}

export function FadeIn({ children, delay = 0, duration = 0.25, ...rest }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration, delay }}
            {...rest}
        >
            {children}
        </motion.div>
    );
}

export function SlideUp({ children, delay = 0, duration = 0.3, ...rest }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
            {...rest}
        >
            {children}
        </motion.div>
    );
}

interface StaggerProps {
    children: ReactNode;
    delay?: number;
    stagger?: number;
}

export function Stagger({ children, delay = 0, stagger = 0.06 }: StaggerProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
            }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children }: { children: ReactNode }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
        >
            {children}
        </motion.div>
    );
}