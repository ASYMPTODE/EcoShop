import React, { useEffect, useState } from 'react'
import './RelatedProducts.css'
import Item from '../Item/Item'
import { backend_url } from '../../App';

const RelatedProducts = ({category, id}) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 4,
    pages: 0
  });

  const fetchRelatedProducts = (page = 1) => {
    setLoading(true);
    fetch(`${backend_url}/relatedproducts?page=${page}&limit=4`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({category: category}),
    })
    .then((res) => res.json())
    .then((data) => {
      setRelated(data.products || []);
      setPagination({
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 4,
        pages: data.pages || 0
      });
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching related products:", err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchRelatedProducts(currentPage);
  }, [category, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredProducts = related.filter(item => id !== item.id);

  return (
    <div className='relatedproducts'>
      <h1>Related Products</h1>
      <hr />
      {loading ? (
        <div className="loading-container">Loading related products...</div>
      ) : (
        <>
          <div className="relatedproducts-item">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item, index) => (
                <Item 
                  key={index} 
                  id={item.id} 
                  name={item.name} 
                  image={item.image} 
                  new_price={item.new_price} 
                  old_price={item.old_price}
                />
              ))
            ) : (
              <div className="no-products">No related products available.</div>
            )}
          </div>
          
          {pagination && pagination.pages > 1 && (
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
          )}
        </>
      )}
    </div>
  )
}

export default RelatedProducts
