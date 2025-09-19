import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../Assets/upload_area.svg";
import { backend_url } from "../../App";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const AddProduct = () => {

  const [image, setImage] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const handleGenerateSampleData = async () => {
    if (!window.confirm("This will add 100 sample products to your database. Do you want to continue?")) {
      return;
    }

    setIsBulkLoading(true);
    try {
      const response = await fetch(`${backend_url}/generate-sample-products`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Success! ${data.productsAdded} sample products have been added to your database.`);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error generating sample data:", error);
      alert("❌ Failed to generate sample data. Please check your backend connection.");
    }
    setIsBulkLoading(false);
  };

  const handleAddProduct = async () => {
    // Basic validation
    if (!productDetails.name || !productDetails.description || !productDetails.category || !productDetails.new_price || !productDetails.old_price || !image) {
      alert("Please fill all fields and select an image.");
      return;
    }

    setIsLoading(true);
    let dataObj;
    let product = productDetails;

    try {
      let formData = new FormData();
      formData.append('product', image);

      const uploadResponse = await fetch(`${backend_url}/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      dataObj = await uploadResponse.json();

      if (dataObj.success) {
        // Use the main image URL for backward compatibility
        product.image = dataObj.image_url;
        
        // Include the comprehensive image data for green software optimization
        if (dataObj.images) {
          product.images = dataObj.images;
        }
        
        console.log('🌱 Green Image Upload Success:', dataObj.green_stats);
        
        const addResponse = await fetch(`${backend_url}/addproduct`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });

        const addData = await addResponse.json();

        if (addData.success) {
          alert(`✅ Product Added Successfully! 
🌱 Green Optimization: ${dataObj.green_stats?.compression_ratio} compression
💾 Bandwidth Saved: ${dataObj.green_stats?.bandwidth_saved}`);
          
          // Reset form
          setProductDetails({
            name: "",
            description: "",
            image: "",
            category: "women",
            new_price: "",
            old_price: ""
          });
          setImage(false);
        } else {
          alert("Failed to add product");
        }
      } else {
        alert("Image upload failed");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("An error occurred while adding the product");
    } finally {
      setIsLoading(false);
    }
  }

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  }

  return (
    <div className="addproduct">
      <div style={{
        background: '#e8f5e8',
        padding: '8px 12px',
        marginBottom: '20px',
        borderRadius: '4px',
        border: '1px solid #4caf50',
        fontSize: '12px',
        color: '#2e7d32'
      }}>
        🌱 Green Software: Images will be automatically optimized to WebP format with 75% quality compression
      </div>
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input type="text" name="name" value={productDetails.name} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
      </div>
      <div className="addproduct-itemfield">
        <p>Product description</p>
        <input type="text" name="description" value={productDetails.description} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input type="number" name="old_price" value={productDetails.old_price} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input type="number" name="new_price" value={productDetails.new_price} onChange={(e) => { changeHandler(e) }} placeholder="Type here" />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product category</p>
        <select value={productDetails.category} name="category" className="add-product-selector" onChange={changeHandler}>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Product image</p>
        <label htmlFor="file-input">
          {!image ? (
            <img className="addproduct-thumbnail-img" src={upload_area} alt="Upload area" />
          ) : (
            <LazyLoadImage
              className="addproduct-thumbnail-img"
              src={URL.createObjectURL(image)}
              alt="Product preview"
              effect="blur"
              width="120px"
              height="120px"
              loading="lazy"
              placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkxvYWRpbmcuLi48L3RleHQ+Cjwvc3ZnPg=="
              threshold={50}
            />
          )}
        </label>
        <input onChange={(e) => setImage(e.target.files[0])} type="file" name="image" id="file-input" accept="image/*" hidden />
      </div>
      <button className="addproduct-btn" onClick={() => { handleAddProduct() }} disabled={isLoading}>
        {isLoading ? "Adding Product..." : "ADD"}
      </button>
      
      <div style={{ margin: "20px 0", padding: "20px", backgroundColor: "#f0f8ff", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>📊 Sample Data Generator</h3>
        <p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "14px" }}>
          Generate 100 sample products with random names, prices, and categories for testing purposes.
        </p>
        <button 
          className="addproduct-btn" 
          onClick={handleGenerateSampleData} 
          disabled={isBulkLoading}
          style={{ backgroundColor: "#28a745", width: "auto", padding: "10px 20px" }}
        >
          {isBulkLoading ? "⏳ Generating..." : "🎲 Generate 100 Sample Products"}
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
