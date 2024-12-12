import React from 'react';
import Hero from './ui/main/hero/Hero';

const Homepage = () => {
  return (
    <div suppressHydrationWarning={true}>
      <Hero />
    </div>
  );
};

export default Homepage;
