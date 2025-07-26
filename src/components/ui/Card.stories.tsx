import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component for displaying content.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <img
          src="/placeholder.svg"
          alt="Product"
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </CardHeader>
      <CardContent>
        <CardTitle className="mb-2">Mystic Forest Poster</CardTitle>
        <CardDescription className="mb-2">
          by Maya Rodriguez
        </CardDescription>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">$29.99</span>
          <Badge variant="secondary">In Stock</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  ),
};

export const ArtistCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <img
            src="/placeholder.svg"
            alt="Artist"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <CardTitle className="mb-1">Maya Rodriguez</CardTitle>
            <CardDescription>Digital Artist</CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">Fantasy</Badge>
              <Badge variant="outline">Digital</Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Follow Artist
        </Button>
      </CardFooter>
    </Card>
  ),
};