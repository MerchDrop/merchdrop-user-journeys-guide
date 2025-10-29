import React from 'react';
import UserProfileSettings from '@/components/user/UserProfileSettings';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function UserProfile() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <UserProfileSettings />
      </main>
      <Footer />
    </div>
  );
}
