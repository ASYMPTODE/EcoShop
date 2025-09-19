import React from 'react'
import './NewCollections.css'
import Item from '../Item/Item'

const NewCollections = ({ data, pagination, loading, onPageChange, currentPage }) => {
  return (
    <div className='new-collections'>
      <div className="collections-header">
        <div className="eco-badge-collections">✨ Fresh Arrivals</div>
        <h1>New Sustainable Collections</h1>
        <p className="collections-subtitle">
          Explore our latest eco-conscious designs, crafted with innovation and sustainability in mind
        </p>
      </div>
      <hr className="collections-divider" />
      {loading ? (
        <div className="loading-container">Loading collections...</div>
      ) : (
        <>
          <div className="collections">
            {data && data.length > 0 ? (
              data.map((item, index) => {
                return <Item id={item.id} key={index} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
              })
            ) : (
              <div className="no-products">No new collections available.</div>
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

export default NewCollections
