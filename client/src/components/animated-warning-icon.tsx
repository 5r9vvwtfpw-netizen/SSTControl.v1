import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function AnimatedWarningIcon() {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        y: [0, -2, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
    >
      <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
    </motion.div>
  );
}
