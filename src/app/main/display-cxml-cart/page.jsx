import React, { Suspense } from 'react'; // Import Suspense from React
import DisplayCxmlCart from "@/app/ui/main/displayCxmlCart/DisplayCxmlCart";

const DisplayCxmlCartPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}> {/* Add Suspense wrapper */}
      <DisplayCxmlCart />
    </Suspense>
  );
}

export default DisplayCxmlCartPage;