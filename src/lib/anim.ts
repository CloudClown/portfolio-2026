import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registered once for the whole app. Importing from here guarantees it.
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
