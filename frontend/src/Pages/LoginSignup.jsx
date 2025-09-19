import React, { useState } from "react";
import "./CSS/LoginSignup.css";
import { backend_url } from "../App";

const LoginSignup = () => {

  const [state,setState] = useState("Login");
  const [formData,setFormData] = useState({username:"",email:"",password:""});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const changeHandler = (e) => {
    setFormData({...formData,[e.target.name]:e.target.value});
    // Clear specific field error when user starts typing
    if (errors[e.target.name]) {
      setErrors({...errors, [e.target.name]: ""});
    }
  }
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (state === "Sign Up" && !formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const login = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(`${backend_url}/login`, {
        method: 'POST',
        headers: {
          Accept:'application/form-data',
          'Content-Type':'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const dataObj = await response.json();
      
      if (dataObj.success && dataObj.token) {
        localStorage.setItem('auth-token', dataObj.token);
        window.location.replace("/");
      } else {
        // Handle validation errors from server
        if (dataObj.errors) {
          if (Array.isArray(dataObj.errors)) {
            // Handle express-validator errors
            const fieldErrors = {};
            dataObj.errors.forEach(error => {
              fieldErrors[error.path || 'general'] = error.msg;
            });
            setErrors(fieldErrors);
          } else {
            // Handle general error message
            setErrors({ general: dataObj.errors });
          }
        } else {
          setErrors({ general: "Login failed. Please check your credentials." });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: "Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(`${backend_url}/signup`, {
        method: 'POST',
        headers: {
          Accept:'application/form-data',
          'Content-Type':'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });
      
      const dataObj = await response.json();
      
      if (dataObj.success && dataObj.token) {
        localStorage.setItem('auth-token', dataObj.token);
        window.location.replace("/");
      } else {
        // Handle validation errors from server
        if (dataObj.errors) {
          if (Array.isArray(dataObj.errors)) {
            // Handle express-validator errors
            const fieldErrors = {};
            dataObj.errors.forEach(error => {
              fieldErrors[error.path || 'general'] = error.msg;
            });
            setErrors(fieldErrors);
          } else {
            // Handle general error message
            setErrors({ general: dataObj.errors });
          }
        } else {
          setErrors({ general: "Registration failed. Please try again." });
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: "Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        
        {/* General error message */}
        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}
        
        <div className="loginsignup-fields">
          {state==="Sign Up" && (
            <div className="field-container">
              <input 
                type="text" 
                placeholder="Your name" 
                name="username" 
                value={formData.username} 
                onChange={changeHandler}
                className={errors.username ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
          )}
          
          <div className="field-container">
            <input 
              type="email" 
              placeholder="Email address" 
              name="email" 
              value={formData.email} 
              onChange={changeHandler}
              className={errors.email ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="field-container">
            <input 
              type="password" 
              placeholder="Password" 
              name="password" 
              value={formData.password} 
              onChange={changeHandler}
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
        </div>

        <button 
          onClick={()=>{state==="Login"?login():signup()}} 
          disabled={isLoading}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? 'Please wait...' : 'Continue'}
        </button>

        {state==="Login"?
        <p className="loginsignup-login">Create an account? <span onClick={()=>{setState("Sign Up"); setErrors({}); setFormData({username:"",email:"",password:""});}}>Click here</span></p>
        :<p className="loginsignup-login">Already have an account? <span onClick={()=>{setState("Login"); setErrors({}); setFormData({username:"",email:"",password:""});}}>Login here</span></p>}

        <div className="loginsignup-agree">
          <input type="checkbox" name="" id="" />
          <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
