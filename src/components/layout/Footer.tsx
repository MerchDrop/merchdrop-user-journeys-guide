
import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold text-black mb-4">
              MerchDrop
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              The ultimate platform for artists to create, sell, and monetize custom merchandise. 
              Turn your creativity into a thriving business.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Artists */}
          <div>
            <h3 className="font-semibold text-black mb-4">For Artists</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/signup" className="text-gray-600 hover:text-black transition-colors">
                  Start Creating
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-black transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-black transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="text-gray-600 hover:text-black transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* For Fans */}
          <div>
            <h3 className="font-semibold text-black mb-4">For Fans</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/artists" className="text-gray-600 hover:text-black transition-colors">
                  Browse Artists
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-black transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-600 hover:text-black transition-colors">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-600 hover:text-black transition-colors">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2024 MerchDrop. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-600 hover:text-black transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-black transition-colors text-sm">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-black transition-colors text-sm">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
