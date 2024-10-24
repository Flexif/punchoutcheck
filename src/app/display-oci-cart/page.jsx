import React, { Suspense } from 'react'; // Import Suspense from React
import DisplayOciCart from "@/app/ui/main/displayOciCart/DisplayOciCart";

const DisplayOciCartPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}> {/* Add Suspense wrapper */}
      <DisplayOciCart />
    </Suspense>
  );
};

export default DisplayOciCartPage;