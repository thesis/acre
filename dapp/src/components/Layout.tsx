import React from "react"
import { AnimatePresence, motion, Variants } from "framer-motion"
import { useState } from "react"
import { useLocation, useOutlet } from "react-router-dom"
import DocsDrawer from "./DocsDrawer"
import Header from "./Header"
import Sidebar from "./Sidebar"
import ModalRoot from "./ModalRoot"

const wrapperVariants: Variants = {
  in: { opacity: 0, y: 48 },
  out: { opacity: 0, y: -48 },
  visible: { opacity: 1, y: 0 },
}

// This tricky component makes Outlet persistent so React and Framer Motion can
// distinguish wheather it should be rerendered between routes.
// Ref: https://github.com/remix-run/react-router/discussions/8008#discussioncomment-1280897
function PersistentOutlet() {
  const [outlet] = useState(useOutlet())
  return outlet
}

function Layout() {
  const location = useLocation()
  return (
    <>
      <Header />
      <AnimatePresence mode="popLayout">
        <motion.main
          key={location.pathname}
          variants={wrapperVariants}
          transition={{ type: "spring", damping: 12, stiffness: 120 }}
          initial="in"
          animate="visible"
          exit="out"
        >
          <PersistentOutlet />
        </motion.main>
      </AnimatePresence>
      <Sidebar />
      <DocsDrawer />
      <ModalRoot />
    </>
  )
}

export default Layout
