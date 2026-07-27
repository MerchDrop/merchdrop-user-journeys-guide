import React, { useState } from 'react';
import {
  FileText,
  Save,
  Plus,
  Trash2,
  Image,
  Megaphone,
  Layout,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function AdminCMS() {
  const { toast } = useToast();

  const [marqueeText, setMarqueeText] = useState('SUMMER SCORCH MERCH OUT NOW!!!');
  const [showMarquee, setShowMarquee] = useState(true);

  const [heroSlides, setHeroSlides] = useState([
    {
      id: '1',
      title: 'SUMMER SCORCH MERCH DROP',
      subtitle: 'Exclusive limited collection from verified creators and artists.',
      buttonText: 'SHOP NOW',
      buttonLink: '/products',
      imageUrl: '/fashion-slider-1.jpg',
    },
    {
      id: '2',
      title: 'AUTHENTIC CREATOR APPAREL',
      subtitle: 'Support independent Nigerian artists and graphic designers.',
      buttonText: 'EXPLORE DROPS',
      buttonLink: '/products',
      imageUrl: '/fashion-slider-2.jpg',
    },
  ]);

  const handleSaveTicker = () => {
    toast({
      title: 'Announcement Ticker Updated',
      description: 'Marquee banner text updated on homepage.',
    });
  };

  const handleSaveHeroSlides = () => {
    toast({
      title: 'Hero Slides Saved',
      description: 'Homepage slider content updated successfully.',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            CMS & Content Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage homepage sliders, announcement banners, ticker text, and promotional banners.
          </p>
        </div>
      </div>

      <Tabs defaultValue="ticker" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="ticker" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" /> Top Marquee Ticker
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Layout className="h-4 w-4" /> Hero Slider Slides
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Top Ticker Banner */}
        <TabsContent value="ticker" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Scrolling Announcement Bar</CardTitle>
              <CardDescription>
                Customize the black marquee ticker text that scrolls at the top of the homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Enable Top Announcement Bar</Label>
                  <p className="text-xs text-muted-foreground">Toggle visibility on front store.</p>
                </div>
                <Switch checked={showMarquee} onCheckedChange={setShowMarquee} />
              </div>

              <div>
                <Label htmlFor="tickerText">Ticker Announcement Text</Label>
                <Input
                  id="tickerText"
                  value={marqueeText}
                  onChange={(e) => setMarqueeText(e.target.value)}
                  className="mt-1.5 font-bold"
                />
              </div>

              {/* Preview */}
              <div className="p-4 bg-black text-white rounded-lg overflow-hidden">
                <p className="text-xs text-zinc-400 mb-2">Live Storefront Preview:</p>
                <div className="whitespace-nowrap font-bold text-sm tracking-wider text-amber-400">
                  {marqueeText} &nbsp;&bull;&nbsp; {marqueeText}
                </div>
              </div>

              <Button onClick={handleSaveTicker}>
                <Save className="h-4 w-4 mr-2" /> Save Ticker Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Hero Slider */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Homepage Hero Slides</CardTitle>
                <CardDescription>Configure main homepage banner carousel slides.</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  setHeroSlides([
                    ...heroSlides,
                    {
                      id: String(Date.now()),
                      title: 'NEW MERCH COLLECTION',
                      subtitle: 'Fresh designs just dropped.',
                      buttonText: 'SHOP NOW',
                      buttonLink: '/products',
                      imageUrl: '/fashion-slider-3.jpg',
                    },
                  ])
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Add Slide
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {heroSlides.map((slide, index) => (
                <div key={slide.id} className="p-4 border rounded-xl space-y-4 relative bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-primary">Slide #{index + 1}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setHeroSlides(heroSlides.filter((s) => s.id !== slide.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Heading Title</Label>
                      <Input
                        value={slide.title}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[index].title = e.target.value;
                          setHeroSlides(updated);
                        }}
                      />
                    </div>

                    <div>
                      <Label>Subtitle Description</Label>
                      <Input
                        value={slide.subtitle}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[index].subtitle = e.target.value;
                          setHeroSlides(updated);
                        }}
                      />
                    </div>

                    <div>
                      <Label>Button Text</Label>
                      <Input
                        value={slide.buttonText}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[index].buttonText = e.target.value;
                          setHeroSlides(updated);
                        }}
                      />
                    </div>

                    <div>
                      <Label>Image URL / Path</Label>
                      <Input
                        value={slide.imageUrl}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[index].imageUrl = e.target.value;
                          setHeroSlides(updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button onClick={handleSaveHeroSlides}>
                <Save className="h-4 w-4 mr-2" /> Save Hero Slider Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
