const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Task Management App crafted by{" "}
            <span className="font-semibold text-gray-800">Ahamathbasha</span>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;