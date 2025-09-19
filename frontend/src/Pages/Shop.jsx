import React, { useEffect, useState } from 'react'
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import Offers from '../Components/Offers/Offers'
import NewCollections from '../Components/NewCollections/NewCollections'
import NewsLetter from '../Components/NewsLetter/NewsLetter'
import { backend_url } from '../App'

const Shop = () => {
  const [popular, setPopular] = useState([]);
  const [popularPage, setPopularPage] = useState(1);
  const [popularPagination, setPopularPagination] = useState({
    total: 0,
    page: 1,
    limit: 4,
    pages: 0,
  });
  const [loadingPopular, setLoadingPopular] = useState(false);

  const [newCollection, setNewCollection] = useState([]);
  const [newCollectionPage, setNewCollectionPage] = useState(1);
  const [newCollectionPagination, setNewCollectionPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    pages: 0,
  });
  const [loadingNewCollection, setLoadingNewCollection] = useState(false);

  const fetchPopular = (page = 1) => {
    setLoadingPopular(true);
    fetch(`${backend_url}/popularinwomen?page=${page}&limit=4`)
      .then((res) => res.json())
      .then((data) => {
        setPopular(data.products);
        setPopularPagination({
          total: data.total,
          page: data.page,
          limit: data.limit,
          pages: data.pages,
        });
        setLoadingPopular(false);
      })
      .catch((err) => {
        console.error('Error fetching popular products:', err);
        setLoadingPopular(false);
      });
  };

  const fetchNewCollection = (page = 1) => {
    setLoadingNewCollection(true);
    fetch(`${backend_url}/newcollections?page=${page}&limit=8`)
      .then((res) => res.json())
      .then((data) => {
        setNewCollection(data.products);
        setNewCollectionPagination({
          total: data.total,
          page: data.page,
          limit: data.limit,
          pages: data.pages,
        });
        setLoadingNewCollection(false);
      })
      .catch((err) => {
        console.error('Error fetching new collections:', err);
        setLoadingNewCollection(false);
      });
  };

  useEffect(() => {
    fetchPopular(popularPage);
  }, [popularPage]);

  useEffect(() => {
    fetchNewCollection(newCollectionPage);
  }, [newCollectionPage]);

  const handlePopularPageChange = (page) => {
    setPopularPage(page);
  };

  const handleNewCollectionPageChange = (page) => {
    setNewCollectionPage(page);
  };

  return (
    <div>
      <Hero />
      <Popular
        data={popular}
        pagination={popularPagination}
        loading={loadingPopular}
        onPageChange={handlePopularPageChange}
        currentPage={popularPage}
      />
      <Offers />
      <NewCollections
        data={newCollection}
        pagination={newCollectionPagination}
        loading={loadingNewCollection}
        onPageChange={handleNewCollectionPageChange}
        currentPage={newCollectionPage}
      />
      <NewsLetter />
    </div>
  );
};

export default Shop;
