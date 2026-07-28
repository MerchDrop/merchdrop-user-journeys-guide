import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Palette, 
  MessageSquare,
  ShoppingBag,
  DollarSign,
  Eye,
  Check,
  AlertCircle
} from 'lucide-react';
import Header from '@/components/layout/Header';

const MerchCreator = () => {
  const [selectedDesignPath, setSelectedDesignPath] = useState<string>('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
  const [productDetails, setProductDetails] = useState({
    name: '',
    description: '',
    price: '',
    productType: 'tshirt',
    selectedDesign: null as string | null,
    uploadedFile: null as File | null,
    designBrief: ''
  });

  // Create and cleanup blob URL for uploaded file preview
  useEffect(() => {
    if (productDetails.uploadedFile) {
      const url = URL.createObjectURL(productDetails.uploadedFile);
      setUploadedFileUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setUploadedFileUrl('');
    }
  }, [productDetails.uploadedFile]);

  const [preUploadedDesigns, setPreUploadedDesigns] = useState<any[]>([]);

  useEffect(() => {
    fetchApprovedDesigns();
  }, []);

  const fetchApprovedDesigns = async () => {
    try {
      const { data } = await supabase
        .from('designs')
        .select('*')
        .eq('status', 'approved');

      if (data && data.length > 0) {
        setPreUploadedDesigns(data.map(d => ({
          id: d.id,
          name: d.title || 'Artwork Design',
          image: d.image_url || '/placeholder.svg',
          category: 'tshirt',
          tags: d.tags || ['artwork'],
        })));
      } else {
        setPreUploadedDesigns([]);
      }
    } catch (e) {
      setPreUploadedDesigns([]);
    }
  };

  const productTypes = [
    { id: 'tshirt', name: 'T-Shirt', basePrice: 15, minPrice: 25 },
    { id: 'hoodie', name: 'Hoodie', basePrice: 25, minPrice: 45 },
    { id: 'cap', name: 'Cap', basePrice: 12, minPrice: 20 },
    { id: 'poster', name: 'Poster', basePrice: 8, minPrice: 15 }
  ];

  const calculateProfit = (price: number, basePrice: number) => {
    const netProfit = price - basePrice;
    return {
      artistShare: netProfit * 0.5,
      platformShare: netProfit * 0.25,
      designerShare: netProfit * 0.1,
      opsShare: netProfit * 0.15,
      netProfit
    };
  };

  const selectedProduct = productTypes.find(p => p.id === productDetails.productType);
  const priceNum = parseFloat(productDetails.price) || 0;
  const profitBreakdown = selectedProduct ? calculateProfit(priceNum, selectedProduct.basePrice) : null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProductDetails(prev => ({
        ...prev,
        uploadedFile: file
      }));
    }
  };

  const handleSubmitProduct = () => {
    console.log('Product submitted:', productDetails);
    // Handle product submission logic
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Create New Merch</h1>
            <p className="text-xl text-muted-foreground">
              Design and launch your next merchandise drop
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Design Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Design Path Selection */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Choose Your Design Path</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedDesignPath} onValueChange={setSelectedDesignPath}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="catalog">Browse Catalog</TabsTrigger>
                      <TabsTrigger value="upload">Upload Design</TabsTrigger>
                      <TabsTrigger value="request">Request Designer</TabsTrigger>
                    </TabsList>

                    {/* Option 1: Pre-uploaded Designs */}
                    <TabsContent value="catalog" className="space-y-4 mt-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        {preUploadedDesigns.map((design) => (
                          <motion.div
                            key={design.id}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                              productDetails.selectedDesign === design.id 
                                ? 'border-primary shadow-hero' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setProductDetails(prev => ({ ...prev, selectedDesign: design.id }))}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <img 
                              src={design.image} 
                              alt={design.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                              <h3 className="font-semibold mb-2">{design.name}</h3>
                              <div className="flex flex-wrap gap-1">
                                {design.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {productDetails.selectedDesign === design.id && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Option 2: Upload Own Design */}
                    <TabsContent value="upload" className="space-y-4 mt-6">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        {productDetails.uploadedFile ? (
                          <div className="space-y-4">
                            <div className="w-32 h-32 mx-auto bg-cover bg-center rounded-lg border"
                                 style={{ backgroundImage: `url(${uploadedFileUrl})` }}>
                            </div>
                            <p className="font-medium">{productDetails.uploadedFile.name}</p>
                            <Button variant="outline" onClick={() => setProductDetails(prev => ({ ...prev, uploadedFile: null }))}>
                              Change File
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                            <div>
                              <Label htmlFor="designUpload" className="cursor-pointer">
                                <Button variant="outline" className="mb-2">
                                  Choose File
                                </Button>
                              </Label>
                              <Input
                                id="designUpload"
                                type="file"
                                accept="image/*,.svg"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <p className="text-sm text-muted-foreground">
                                PNG, JPG, SVG up to 10MB. Recommended: 300 DPI, 4000x4000px
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Option 3: Request Designer */}
                    <TabsContent value="request" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="designBrief">Design Brief</Label>
                          <Textarea
                            id="designBrief"
                            value={productDetails.designBrief}
                            onChange={(e) => setProductDetails(prev => ({ ...prev, designBrief: e.target.value }))}
                            placeholder="Describe your vision: style, colors, theme, mood, inspiration..."
                            className="min-h-[120px] mt-1"
                          />
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-blue-900 dark:text-blue-100">Designer Collaboration</p>
                              <p className="text-sm text-blue-700 dark:text-blue-200">
                                Our design team will create custom artwork based on your brief. 
                                You'll receive a mockup within 48 hours for approval.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span>Product Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        value={productDetails.name}
                        onChange={(e) => setProductDetails(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Summer Vibes Tee"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="productType">Product Type</Label>
                      <select
                        id="productType"
                        value={productDetails.productType}
                        onChange={(e) => setProductDetails(prev => ({ ...prev, productType: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                      >
                        {productTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name} (Min. ${type.minPrice})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={productDetails.description}
                      onChange={(e) => setProductDetails(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your product..."
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Pricing & Preview */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Pricing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="price">Retail Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={productDetails.price}
                      onChange={(e) => setProductDetails(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      className="mt-1"
                      min={selectedProduct?.minPrice}
                    />
                    {selectedProduct && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Minimum price: ${selectedProduct.minPrice} (covers ${selectedProduct.basePrice} production cost)
                      </p>
                    )}
                  </div>

                  {profitBreakdown && priceNum >= (selectedProduct?.minPrice || 0) && (
                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg space-y-2">
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        Profit Breakdown (${profitBreakdown.netProfit.toFixed(2)} net)
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Your share (50%):</span>
                          <span className="font-medium">${profitBreakdown.artistShare.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Platform (25%):</span>
                          <span>${profitBreakdown.platformShare.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Designer (10%):</span>
                          <span>${profitBreakdown.designerShare.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Operations (15%):</span>
                          <span>${profitBreakdown.opsShare.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {priceNum > 0 && priceNum < (selectedProduct?.minPrice || 0) && (
                    <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-200">
                        Price must be at least ${selectedProduct?.minPrice} to cover production costs
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-6 text-center">
                    <div className="w-full h-40 bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-muted-foreground">Product Mockup</span>
                    </div>
                    <h3 className="font-semibold mb-2">
                      {productDetails.name || 'Product Name'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {productDetails.description || 'Product description...'}
                    </p>
                    <div className="text-lg font-bold text-primary">
                      ${productDetails.price || '0.00'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Button 
                onClick={handleSubmitProduct}
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={!selectedDesignPath || !productDetails.name || !productDetails.price}
              >
                Submit for Approval
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchCreator;