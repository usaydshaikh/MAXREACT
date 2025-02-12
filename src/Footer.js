import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="#">Terms & Conditions</a>
        <a href="#">Privacy Notice</a>
        <a href="#">Personal Information Request</a>
        <a href="#">Copyright Act Policy</a>
      </div>
      <img src="/branding/MAXX-Energy-Logo-1B.png" alt="Maxx Energy Footer Logo" />
      <p>&copy; 2025 Maxx Energy. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
