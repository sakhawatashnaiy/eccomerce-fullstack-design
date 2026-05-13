import { motion, useReducedMotion } from 'framer-motion'

export default function PageTransition({ children }) {
	const shouldReduceMotion = useReducedMotion()
	const MotionDiv = motion.div

	return (
		<MotionDiv
			initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
			animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
			exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
			transition={{ duration: 0.2, ease: 'easeOut' }}
		>
			{children}
		</MotionDiv>
	)
}
