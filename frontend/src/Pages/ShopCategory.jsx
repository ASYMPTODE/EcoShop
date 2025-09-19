import React, { useEffect, useState, useContext } from "react";
import "./CSS/ShopCategory.css";
import Item from "../Components/Item/Item";
import { Link } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";

const ShopCategory = (props) => {
  const { products, pagination, loading, fetchProducts } = useContext(ShopContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Fetch products with the category filter
    fetchProducts(currentPage, 8, props.category);
  }, [currentPage, props.category]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  // Filter by search term and sort products
  let filteredProducts = products.filter((item) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortKey === "price-asc") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.new_price - b.new_price);
  } else if (sortKey === "price-desc") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.new_price - a.new_price);
  } else if (sortKey === "name") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="shopcategory">
      <img src={props.banner} className="shopcategory-banner" alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing {filteredProducts.length}</span> out of {pagination.total} Products
          {loading && <span className="loading-indicator"> (Loading...)</span>}
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: "0.5rem", flex: 1 }}
          />
          <select value={sortKey} onChange={e => setSortKey(e.target.value)} style={{ padding: "0.5rem" }}>
            <option value="">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">Loading products...</div>
      ) : (
        <div className="shopcategory-products">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item, i) => (
              <Item 
                id={item.id} 
                key={i} 
                name={item.name} 
                image={item.image} 
                new_price={item.new_price} 
                old_price={item.old_price}
              />
            ))
          ) : (
            <div className="no-products">No products found matching your criteria.</div>
          )}
        </div>
      )}
      
      <div className="pagination-controls">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1 || loading}
          className="pagination-button"
        >
          Previous
        </button>
        
        <span className="pagination-info">
          Page {currentPage} of {pagination.pages || 1}
        </span>
        
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage >= pagination.pages || loading}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ShopCategory;
