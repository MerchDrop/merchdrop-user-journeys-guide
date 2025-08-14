import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Flame } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

const TrendingProducts = () => {
  const { formatPrice } = useCurrency();
  const products = [
    {
      id: 1,
      name: "Neon Dreams Hoodie",
      artist: "Alex Rivera",
      artistHandle: "@alexart",
      price: 59.99,
      originalPrice: 69.99,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
      likes: 342,
      sales: 89,
      trending: true,
      onSale: true
    },
    {
      id: 2,
      name: "Minimalist Wave Tee",
      artist: "Maya Chen",
      artistHandle: "@mayavisuals",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      likes: 256,
      sales: 124,
      trending: true,
      onSale: false
    },
    {
      id: 3,
      name: "Anime Cat Cap",
      artist: "Jordan Blake",
      artistHandle: "@jordanart",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
      likes: 418,
      sales: 203,
      trending: true,
      onSale: false
    },
    {
      id: 4,
      name: "Abstract Art Tote",
      artist: "Sofia Martinez",
      artistHandle: "@sofiamakes",
      price: 19.99,
      originalPrice: 24.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      likes: 189,
      sales: 67,
      trending: false,
      onSale: true
    },
    {
      id: 5,
      name: "Streetwear Bomber",
      artist: "Alex Rivera",
      artistHandle: "@alexart",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
      likes: 312,
      sales: 45,
      trending: true,
      onSale: false
    },
    {
      id: 6,
      name: "Cosmic Pattern Sweatshirt",
      artist: "Maya Chen",
      artistHandle: "@mayavisuals",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=400&h=400&fit=crop",
      likes: 274,
      sales: 78,
      trending: false,
      onSale: false
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-h2 lg:text-h2-lg font-bold mb-6 text-foreground">
            Shop artist drops
          </h2>
          <p className="text-body lg:text-body-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the hottest merchandise from our creative community. From streetwear to accessories, find your perfect style.
          </p>
        </div>

        {/* Products Grid - gallery layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-16 lg:mb-20">
          {products.map((product, index) => (
            <Card key={product.id} className="group hover-card-lift cursor-pointer transition-design-smooth border border-border bg-white shadow-design-card">
              <CardContent className="p-0">
                
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {product.trending && (
                      <Badge className="bg-accent text-accent-foreground text-meta">
                        <Flame className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    {product.onSale && (
                      <Badge className="bg-destructive text-destructive-foreground text-meta">
                        Sale
                      </Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white p-2 rounded-full hover:bg-white transition-colors shadow-design-card">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary-hover transition-colors shadow-design-card">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Artist */}
                  <Link 
                    to={`/artist/${product.artistHandle.slice(1)}`}
                    className="text-meta lg:text-meta-lg text-muted-foreground hover:text-accent transition-colors hover-accent-underline"
                  >
                    by {product.artist}
                  </Link>

                  {/* Product Name */}
                  <h3 className="text-dashboard-title lg:text-dashboard-title-lg font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-body lg:text-body-lg font-bold text-foreground">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-dashboard-text text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-dashboard-text text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {product.likes}
                    </div>
                    <div>
                      {product.sales} sold
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Button size="lg" className="btn-primary px-8 py-4 text-base" asChild>
            <Link to="/products">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;