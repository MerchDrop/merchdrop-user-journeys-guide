import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDesigners } from '@/hooks/useDesignersQuery';
import { useArtists } from '@/hooks/useArtistsQuery';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const DesignUpload = () => {
  const [formData, setFormData] = useState({
    artist_id: '',
    title: '',
    description: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const { uploadDesign } = useDesigners();
  const { artists } = useArtists();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });
    
    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid Files",
        description: "Some files were rejected. Only JPEG, PNG, SVG, and PDF files under 10MB are allowed.",
        variant: "destructive",
      });
    }
    
    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.artist_id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('design-files')
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.artist_id || !formData.title || files.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload at least one file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const fileUrls = await uploadFiles();
      
      await uploadDesign({
        ...formData,
        file_urls: fileUrls
      });
      
      // Reset form
      setFormData({ artist_id: '', title: '', description: '' });
      setFiles([]);
      
      toast({
        title: "Success",
        description: "Design uploaded successfully! It will be reviewed by our team.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Design</CardTitle>
          <CardDescription>
            Share your creative work with artists on our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="artist">Select Artist *</Label>
              <Select 
                value={formData.artist_id} 
                onValueChange={(value) => setFormData({...formData, artist_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an artist" />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.artist_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Design Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter a catchy title for your design"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your design concept, inspiration, or usage ideas..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Design Files *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload your design files (JPEG, PNG, SVG, PDF)
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.svg,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>Choose Files</span>
                  </Button>
                </Label>
              </div>
              
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected Files:</p>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Design'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};