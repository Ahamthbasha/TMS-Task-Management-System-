import "./css/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-text">
            Task Management App crafted by{" "}
            <span className="footer-highlight">Ahamathbasha</span>
          </p>
          <p className="footer-copyright">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;