import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ShoppingBag, ArrowRight, Flame, Sparkles, Star, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShopArtistDrops = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const products = [
    {
      id: 1,
      name: "Neon Wave Tee",
      artist: "Ayo",
      price: 38,
      description: "Unisex Tee • 4 colors",
      image: "https://images.unsplash.com/photo-1520975922284-9e0ce8272aa9?q=80&w=1600&auto=format&fit=crop",
      avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop",
      badge: {
        icon: Flame,
        text: "Limited"
      }
    },
    {
      id: 2,
      name: "Mono Crest Hoodie",
      artist: "Maya",
      price: 64,
      description: "Heavyweight Hoodie • 3 colors",
      image: "https://images.unsplash.com/photo-1520975858867-42599dc181dd?q=80&w=1600&auto=format&fit=crop",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      badge: {
        icon: Sparkles,
        text: "New"
      }
    },
    {
      id: 3,
      name: "Orbit Dad Cap",
      artist: "Jon",
      price: 28,
      description: "Adjustable Cap • 2 colors",
      image: "https://images.unsplash.com/photo-1542060748-10c28b62716a?q=80&w=1600&auto=format&fit=crop",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      badge: {
        icon: Star,
        text: "Best seller"
      }
    }
  ];

  return (
    <section id="shop" className="relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between gap-4 mb-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-meta text-muted-foreground">
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              Shop
            </div>
            <h2 className="text-h2 md:text-h2-lg tracking-tight mt-1 font-medium text-foreground">
              Shop artist drops
            </h2>
            <p className="text-meta mt-1 text-muted-foreground">
              Popular right now — limited runs and fresh releases.
            </p>
          </div>
          <Link 
            to="/products" 
            className="hidden md:inline-flex items-center gap-1.5 text-meta text-muted-foreground hover:text-foreground transition-colors"
          >
            View all drops
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 + index * 0.1 }}
            >
              <Link 
                to={`/product/${product.id}`}
                className="group rounded-xl border overflow-hidden hover:shadow-sm transition-all hover:-translate-y-0.5 border-border bg-card block"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/5] bg-muted">
                  <img 
                    src={product.image} 
                    alt={`${product.name} by ${product.artist}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Badge */}
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] bg-background/90 border-border text-muted-foreground">
                    <product.badge.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {product.badge.text}
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-meta font-medium shadow-sm bg-background text-foreground border-border">
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                      View product
                    </span>
                    <button className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background border-border hover:bg-muted transition-colors">
                      <Heart className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <img 
                      src={product.avatar} 
                      alt={`${product.artist} avatar`}
                      className="h-6 w-6 rounded-full border border-border"
                    />
                    <span className="text-meta text-muted-foreground">{product.artist}</span>
                    <span className="ml-auto text-meta font-medium text-foreground">${product.price}</span>
                  </div>
                  <div className="mt-1 text-dashboard-text font-medium text-foreground">{product.name}</div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">{product.description}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 flex justify-center md:hidden"
        >
          <Link 
            to="/products"
            className="inline-flex items-center gap-1.5 text-meta text-muted-foreground hover:text-foreground transition-colors"
          >
            View all drops
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ShopArtistDrops;