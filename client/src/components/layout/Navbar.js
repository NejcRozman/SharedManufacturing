import React from 'react'

import AuthOptions from '../auth/AuthOptions'

const Navbar = () => {

  return (
      <nav>
          <div className={"nav-center"}>
              <div className='nav-header'>
                  <h2 className={"nav-heading"}>
                      <a href={'/'}>SharedManufacturing</a>
                  </h2>
              </div>
              <div className='nav-links-container'>
                  <ul>
                      <AuthOptions/>
                  </ul>
              </div>
          </div>
      </nav>
  )





};

export default Navbar
