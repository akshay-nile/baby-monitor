import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = { children: ReactNode };

function PageAnimation({ children }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0.1, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.1, scale: 0.9 }}
            transition={{ duration: 0.2 }}>
            {children}
        </motion.div>
    );
}

export default PageAnimation;