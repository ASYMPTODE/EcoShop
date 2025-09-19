import React from 'react'
import './Popular.css'
import Item from '../Item/Item'

const Popular = ({ data, pagination, loading, onPageChange, currentPage }) => {
  return (
    <div className='popular'>
      <div className="popular-header">
        <div className="eco-badge-popular">🌟 Most Loved</div>
        <h1>Popular Sustainable Fashion</h1>
        <p className="popular-subtitle">
          Discover our most-loved eco-friendly pieces, chosen by conscious consumers worldwide
        </p>
      </div>
      <hr className="popular-divider" />
      {loading ? (
        <div className="loading-container">Loading popular items...</div>
      ) : (
        <>
          <div className="popular-item">
            {data && data.length > 0 ? (
              data.map((item, index) => {
                return <Item id={item.id} key={index} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
              })
            ) : (
              <div className="no-products">No popular items available.</div>
            )}
          </div>
          
          {pagination && pagination.pages > 1 && (
            <div className="pagination-controls">
              <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1 || loading}
                className="pagination-button"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {pagination.pages || 1}
              </span>
              
              <button 
                onClick={() => onPageChange(currentPage + 1)} 
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

export default Popular
