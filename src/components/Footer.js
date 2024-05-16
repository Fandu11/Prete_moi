import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="contact-icons">
        <a href="mailto:delmatpm@orange.fr">
          <img src="mail.svg" alt="Envoyer un email" />
        </a>
        <a href="tel:+33631045096">
          <img src="phone.svg" alt="Appeler" />
        </a>
      </div>
      <p className="font2">©2024 Delmas Mathis</p>
    </footer>
  );
}

export default Footer;
