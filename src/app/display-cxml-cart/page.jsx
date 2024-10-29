
import React, { Suspense } from 'react';
import DisplayCxmlCart from '@/app/ui/main/displayCxmlCart/DisplayCxmlCart';

const DisplayCxmlCartPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DisplayCxmlCart />
    </Suspense>
  );
};

export default DisplayCxmlCartPage;
