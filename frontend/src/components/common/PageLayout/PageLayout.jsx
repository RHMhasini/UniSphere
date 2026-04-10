import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './PageLayout.css';

function PageLayout({ theme, toggleTheme, children }) {
  return (
    <div className="page-layout">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="page-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default PageLayout;
