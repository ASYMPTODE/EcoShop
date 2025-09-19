import React, { useContext, useRef, useState } from 'react'
import './Navbar.css'
import { Link } from 'react-router-dom'
import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import { ShopContext } from '../../Context/ShopContext'
import nav_dropdown from '../Assets/nav_dropdown.png'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

const Navbar = () => {

  let [menu,setMenu] = useState("shop");
  const {getTotalCartItems} = useContext(ShopContext);

  const menuRef = useRef();

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  }

  return (
    <div className='nav'>
      <div className="nav-container">
        <Link to='/' onClick={()=>{setMenu("shop")}} style={{ textDecoration: 'none' }} className="nav-logo">
          <div className="logo-container">
            <span className="logo-icon">🌱</span>
            <div className="logo-text">
              <span className="brand-name">EcoShop</span>
              <span className="brand-tagline">Sustainable Fashion</span>
            </div>
          </div>
        </Link>
        
        <div className="nav-eco-badge">
          <span className="eco-icon">♻️</span>
          <span className="eco-text">Carbon Neutral</span>
        </div>
        
        <LazyLoadImage onClick={dropdown_toggle} className='nav-dropdown' src={nav_dropdown} alt="Menu dropdown" width="auto" height="30px" loading="eager" />
        
        <ul ref={menuRef} className="nav-menu">
          <li onClick={()=>{setMenu("shop")}} className={menu==="shop" ? "active" : ""}>
            <Link to='/' style={{ textDecoration: 'none' }}>
              <span className="nav-icon">🏪</span>
              Shop All
            </Link>
          </li>
          <li onClick={()=>{setMenu("mens")}} className={menu==="mens" ? "active" : ""}>
            <Link to='/mens' style={{ textDecoration: 'none' }}>
              <span className="nav-icon">👔</span>
              Men
            </Link>
          </li>
          <li onClick={()=>{setMenu("womens")}} className={menu==="womens" ? "active" : ""}>
            <Link to='/womens' style={{ textDecoration: 'none' }}>
              <span className="nav-icon">👗</span>
              Women
            </Link>
          </li>
          <li onClick={()=>{setMenu("kids")}} className={menu==="kids" ? "active" : ""}>
            <Link to='/kids' style={{ textDecoration: 'none' }}>
              <span className="nav-icon">🧸</span>
              Kids
            </Link>
          </li>
          <li className="nav-sustainability">
            <Link to='/sustainability' style={{ textDecoration: 'none' }}>
              <span className="nav-icon">🌍</span>
              Our Impact
            </Link>
          </li>
        </ul>
        
        <div className="nav-login-cart">
          {localStorage.getItem('auth-token')
          ?<button className="btn-secondary logout-btn" onClick={()=>{localStorage.removeItem('auth-token');window.location.replace("/");}}>
            <span>👋</span> Logout
           </button>
          :<Link to='/login' style={{ textDecoration: 'none' }}>
            <button className="btn-primary login-btn">
              <span>🔐</span> Login
            </button>
           </Link>}
          
          <Link to="/cart" className="cart-link">
            <div className="cart-container">
              <span className="cart-icon">🛒</span>
              <div className="nav-cart-count">{getTotalCartItems()}</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Navbar
