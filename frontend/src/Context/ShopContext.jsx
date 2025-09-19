import React, { createContext, useEffect, useState } from "react";
import { backend_url } from "../App";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    pages: 0
  });
  const [loading, setLoading] = useState(false);

  const getDefaultCart = () => {
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    return cart;
  };

  const [cartItems, setCartItems] = useState(getDefaultCart());

  // Function to fetch products with pagination
  const fetchProducts = (page = 1, limit = 8, category = '') => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(category && { category })
    }).toString();
    
    fetch(`${backend_url}/allproducts?${queryParams}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          setPagination(data.pagination || { total: 0, page: 1, limit: 8, pages: 0 });
        } else {
          console.error("Invalid product data received:", data);
          setProducts([]);
          setPagination({ total: 0, page: 1, limit: 8, pages: 0 });
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setProducts([]);
        setPagination({ total: 0, page: 1, limit: 8, pages: 0 });
        setLoading(false);
        // You could show a user-friendly error message here
      });
  };

  useEffect(() => {
    // Initial fetch of products
    fetchProducts();

    // Fetch cart if user is logged in
    if (localStorage.getItem("auth-token")) {
      fetch(`${backend_url}/getcart`, {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
          'auth-token': `${localStorage.getItem("auth-token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(),
      })
        .then((resp) => resp.json())
        .then((data) => { setCartItems(data) });
    }
  }, [])

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        try {
          let itemInfo = products.find((product) => product.id === Number(item));
          totalAmount += cartItems[item] * itemInfo.new_price;
        } catch (error) {}
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        try {
          let itemInfo = products.find((product) => product.id === Number(item));
          totalItem += itemInfo ? cartItems[item] : 0 ;
        } catch (error) {}
      }
    }
    return totalItem;
  };

  const addToCart = (itemId) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please Login");
      return;
    }
    
    if (!itemId || itemId <= 0) {
      console.error("Invalid item ID for cart:", itemId);
      return;
    }
    
    fetch(`${backend_url}/addtocart`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'auth-token': `${localStorage.getItem("auth-token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ "itemId": itemId }),
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        // Refresh cart from backend
        return fetch(`${backend_url}/getcart`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'auth-token': `${localStorage.getItem("auth-token")}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(),
        });
      })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          const cartData = data.items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {});
          setCartItems({ ...getDefaultCart(), ...cartData });
        } else {
          console.error("Invalid cart data received:", data);
        }
      })
      .catch(error => {
        console.error("Error adding to cart:", error);
        alert("Failed to add item to cart. Please try again.");
      });
  };

  const removeFromCart = (itemId) => {
    if (!localStorage.getItem("auth-token")) {
      alert("Please Login");
      return;
    }
    
    if (!itemId || itemId <= 0) {
      console.error("Invalid item ID for cart removal:", itemId);
      return;
    }
    
    fetch(`${backend_url}/removefromcart`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'auth-token': `${localStorage.getItem("auth-token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ "itemId": itemId }),
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        // Refresh cart from backend
        return fetch(`${backend_url}/getcart`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'auth-token': `${localStorage.getItem("auth-token")}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(),
        });
      })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          const cartData = data.items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {});
          setCartItems({ ...getDefaultCart(), ...cartData });
        } else {
          // If no items, set to default empty cart
          setCartItems(getDefaultCart());
        }
      })
      .catch(error => {
        console.error("Error removing from cart:", error);
        alert("Failed to remove item from cart. Please try again.");
      });
  };

  const contextValue = { 
    products, 
    getTotalCartItems, 
    cartItems, 
    addToCart, 
    removeFromCart, 
    getTotalCartAmount,
    pagination,
    loading,
    fetchProducts
  };
  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
