import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png'
import { backend_url, currency } from "../../App";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backend_url}/allproducts`);
      const data = await response.json();
      setAllProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  const removeProduct = async (id) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      setRemovingId(id);
      try {
        const response = await fetch(`${backend_url}/removeproduct`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: id }),
        });

        const data = await response.json();

        if (data.success) {
          alert("Product removed successfully!");
          fetchInfo(); // Refresh the list
        } else {
          alert("Failed to remove product");
        }
      } catch (error) {
        console.error("Error removing product:", error);
        alert("An error occurred while removing the product");
      } finally {
        setRemovingId(null);
      }
    }
  }

  // Filter and sort products
  let filteredProducts = allproducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (sortKey === "price-asc") {
    filteredProducts = filteredProducts.sort((a, b) => a.new_price - b.new_price);
  } else if (sortKey === "price-desc") {
    filteredProducts = filteredProducts.sort((a, b) => b.new_price - a.new_price);
  } else if (sortKey === "name") {
    filteredProducts = filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortKey === "category") {
    filteredProducts = filteredProducts.sort((a, b) => a.category.localeCompare(b.category));
  }

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      <div style={{
        background: '#e8f5e8',
        padding: '8px 12px',
        marginBottom: '10px',
        borderRadius: '4px',
        border: '1px solid #4caf50',
        fontSize: '12px',
        color: '#2e7d32'
      }}>
        🌱 Green Software: Images optimized with WebP compression and lazy loading
      </div>
      {isLoading && <p>Loading products...</p>}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
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
          <option value="category">Category</option>
        </select>
      </div>
      <div className="listproduct-format-main">
        <p>Products</p> <p>Title</p> <p>Old Price</p> <p>New Price</p> <p>Category</p> <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {filteredProducts.map((e, index) => (
          <div key={index}>
            <div className="listproduct-format-main listproduct-format">
              <LazyLoadImage
                className="listproduct-product-icon"
                src={e.image}
                alt={e.name || "Product image"}
                effect="blur"
                width="55px"
                height="55px"
                loading="lazy"
                placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNTUiIHZpZXdCb3g9IjAgMCA1NSA1NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU1IiBoZWlnaHQ9IjU1IiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
                threshold={100}
                delayMethod="throttle"
                delayTime={200}
                onError={(e) => {
                  console.log('Image load error:', e.target.src);
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNTUiIHZpZXdCb3g9IjAgMCA1NSA1NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU1IiBoZWlnaHQ9IjU1IiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg==";
                }}
              />
              <p className="cartitems-product-title">{e.name}</p>
              <p>{currency}{e.old_price}</p>
              <p>{currency}{e.new_price}</p>
              <p>{e.category}</p>
              <img
                className="listproduct-remove-icon"
                onClick={() => { removeProduct(e.id) }}
                src={cross_icon}
                alt=""
                style={{
                  opacity: removingId === e.id ? 0.5 : 1,
                  cursor: removingId === e.id ? 'not-allowed' : 'pointer'
                }}
              />
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
