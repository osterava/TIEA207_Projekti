import React from 'react'
import sale from '../images/sale.png'
import cc from '../images/cc.png'
import person from '../images/person.png'
/**
 * The Footer component renders the footer section of the page, which includes
 * the team members' names and the copyright information for the project.
 * It dynamically displays the current year in the copyright notice.
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p> Onni | Petri | Joakim | Olli </p>
        <p>&copy; {new Date().getFullYear()} DebtMap, Course: TIEA207 </p>
        <p>License: <strong>CC BY-NC 4.0 </strong> </p>
        <div className='license_photos'>
          <img src={sale} alt="sale_license_logo" className='licences'/>
          <img src={cc} alt="cc_license_logo" className='licences'/>
          <img src={person} alt="person_license_logo" className='licences'/>
        </div>
        <p>This license requires that reusers give credit to the creators.
           It allows reusers to distribute, remix, adapt,
           and build upon the material in any medium or format, for noncommercial purposes only.
        </p>
      </div>
    </footer>
  )
}

export default Footer
