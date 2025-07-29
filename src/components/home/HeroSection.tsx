import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Star, TrendingUp, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from './SearchBar';
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center bg-white text-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="mb-8">
            <Badge variant="outline" className="mb-4 border-black text-black">
              <Sparkles className="h-4 w-4 mr-2" />
              New Platform Launch
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Your Music.
              <br />
              <span className="text-black">Your Merch.</span>
              <br />
              Your Revenue.
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">The ultimate platform for artists to co-create, sell, and monetize custom merchandise. Turn your creativity into a thriving business.</p>
          </motion.div>

          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <SearchBar />
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg">
              Start Creating
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-black text-black hover:bg-black hover:text-white px-8 py-4 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-black mr-2" />
                <span className="text-2xl font-bold text-black">10k+</span>
              </div>
              <p className="text-gray-600">Active Artists</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-black mr-2" />
                <span className="text-2xl font-bold text-black">$2M+</span>
              </div>
              <p className="text-gray-600">Revenue Generated</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-black mr-2" />
                <span className="text-2xl font-bold text-black">50k+</span>
              </div>
              <p className="text-gray-600">Products Sold</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
};
export default HeroSection;