import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DesignSelectionDialog } from './DesignSelectionDialog';

interface Design {
  id: string;
  title: string;
  description?: string;
  file_urls: string[];
  created_at: string;
  designer?: {
    designer_name: string;
  };
}

interface DesignGalleryProps {
  designs: Design[];
  artistId?: string;
}

export function DesignGallery({ designs, artistId }: DesignGalleryProps) {
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {designs.map((design) => (
          <Card key={design.id}>
            <CardHeader>
              <CardTitle className="text-lg">{design.title}</CardTitle>
              <CardDescription>
                By {design.designer?.designer_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {design.file_urls[0] && (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative aspect-square cursor-pointer group">
                      <img
                        src={design.file_urls[0]}
                        alt={design.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{design.title}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      {design.file_urls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`${design.title} - ${idx + 1}`}
                          className="w-full rounded-lg"
                        />
                      ))}
                    </div>
                    {design.description && (
                      <p className="text-sm text-muted-foreground mt-4">
                        {design.description}
                      </p>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setSelectedDesign(design)}
                className="w-full"
              >
                Select for Product
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedDesign && artistId && (
        <DesignSelectionDialog
          design={selectedDesign}
          artistId={artistId}
          open={!!selectedDesign}
          onOpenChange={(open) => !open && setSelectedDesign(null)}
        />
      )}
    </>
  );
}
