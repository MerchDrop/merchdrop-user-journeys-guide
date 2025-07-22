import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Star, Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const productData = {
  id: 1,
  name: "Midnight Vibes Hoodie",
  artist: "Luna Rivers",
  price: "$55",
  originalPrice: "$75",
  rating: 4.9,
  reviews: 234,
  description: "Immerse yourself in the ethereal world of Luna Rivers with this premium hoodie. Featuring her signature Midnight Vibes artwork, this piece combines comfort with artistic expression.",
  features: [
    "100% premium cotton blend",
    "Unisex fit for all body types", 
    "Eco-friendly water-based inks",
    "Pre-shrunk for lasting fit",
    "Kangaroo pocket design"
  ],
  images: [
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=600&fit=crop&auto=format"
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  colors: [
    { name: "Midnight Black", value: "#1a1a1a" },
    { name: "Deep Purple", value: "#6b46c1" },
    { name: "Ocean Blue", value: "#0ea5e9" }
  ]
};

const reviews = [
  {
    id: 1,
    name: "Alex Chen",
    rating: 5,
    comment: "Amazing quality! The design is even more beautiful in person.",
    date: "2 weeks ago"
  },
  {
    id: 2, 
    name: "Sarah Miller",
    rating: 5,
    comment: "Perfect fit and the artwork is stunning. Luna's best merch yet!",
    date: "1 month ago"
  },
  {
    id: 3,
    name: "Mike Rodriguez", 
    rating: 4,
    comment: "Great hoodie, very comfortable. Shipping was fast too.",
    date: "3 weeks ago"
  }
];

export default function ProductDetail() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div className="aspect-square rounded-3xl overflow-hidden mb-4 bg-cover bg-center shadow-hero"
                   style={{ backgroundImage: `url(${productData.images[selectedImage]})` }}>
              </div>
              
              {/* Thumbnail Images */}
              <div className="flex gap-4">
                {productData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-xl bg-cover bg-center border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundImage: `url(${image})` }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="mb-2">By {productData.artist}</Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{productData.name}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                    <span className="font-semibold">{productData.rating}</span>
                    <span className="text-muted-foreground ml-2">({productData.reviews} reviews)</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-primary">{productData.price}</span>
                  <span className="text-xl text-muted-foreground line-through">{productData.originalPrice}</span>
                  <Badge variant="destructive">27% OFF</Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-foreground/80 leading-relaxed">{productData.description}</p>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">Features:</h3>
                <ul className="space-y-2">
                  {productData.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="font-semibold mb-3">Color:</h3>
                <div className="flex gap-3">
                  {productData.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-12 h-12 rounded-full border-2 ${
                        selectedColor === index ? 'border-primary' : 'border-muted'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{productData.colors[selectedColor].name}</p>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="font-semibold mb-3">Size:</h3>
                <div className="grid grid-cols-6 gap-3">
                  {productData.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                      className="aspect-square"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="font-semibold mb-3">Quantity:</h3>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <Button size="lg" className="w-full">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart - {productData.price}
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  Buy Now
                </Button>
              </div>

              {/* Shipping Info */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 mr-3" />
                  Free shipping on orders over $50
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mr-3" />
                  Secure checkout with SSL encryption
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <RotateCcw className="h-4 w-4 mr-3" />
                  30-day return policy
                </div>
              </div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20"
          >
            <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{review.name}</h4>
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3">{review.comment}</p>
                  <p className="text-sm text-muted-foreground">{review.date}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}