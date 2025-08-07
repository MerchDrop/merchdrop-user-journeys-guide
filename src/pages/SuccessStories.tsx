import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHelmet from '@/components/SEO/SEOHelmet';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SuccessStories() {
  const stories = [
    {
      name: "Sarah Chen",
      role: "Digital Artist",
      image: "/placeholder.svg",
      story: "I went from selling 0 products to making $5,000 monthly revenue in just 3 months with MerchDrop. The platform made it so easy to turn my art into profitable merchandise.",
      sales: "$15K+ total sales"
    },
    {
      name: "Marcus Rodriguez",
      role: "Musician",
      image: "/placeholder.svg",
      story: "MerchDrop helped me create a sustainable income stream from my music. My fans love the quality and I love the passive income.",
      sales: "$8K+ monthly"
    },
    {
      name: "Emily Johnson",
      role: "Content Creator",
      image: "/placeholder.svg",
      story: "The integration with my existing brand was seamless. MerchDrop handles everything while I focus on creating content.",
      sales: "$25K+ total sales"
    }
  ];

  return (
    <div className="min-h-screen">
      <SEOHelmet 
        title="Success Stories - Real Artists, Real Results | MerchDrop"
        description="Discover how artists and creators are building successful merchandise businesses with MerchDrop. Read inspiring success stories and case studies."
        keywords="success stories, artist testimonials, merchandise success, creator earnings"
      />
      <Header />
      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Success Stories</h1>
            <p className="text-xl text-muted-foreground">Real artists achieving real results</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {stories.map((story, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={story.image} alt={story.name} />
                      <AvatarFallback>{story.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{story.name}</h3>
                      <p className="text-sm text-muted-foreground">{story.role}</p>
                    </div>
                  </div>
                  <blockquote className="text-muted-foreground mb-4 italic">
                    "{story.story}"
                  </blockquote>
                  <div className="text-sm font-semibold text-primary">
                    {story.sales}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}