import React from 'react'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p> Onni | Petri | Joakim | Olli </p>
        <p>&copy; {new Date().getFullYear()} Velkakartta. TIEA207 </p>
      </div>
    </footer>
  )
}

export default Footer
