import React from 'react';
import { getAllRestaurants } from '@/actions/select';
import GlobalRanking from './AllRanking';

export default async function HomePage() {

  // Fetch restaurants data on the server side
  const restaurants = await getAllRestaurants();

  return (
    <div className='container mx-auto p-4'>
      {/* <h1 className="text-2xl font-bold mb-4">Restaurant ELO Ranking</h1> */}
      <GlobalRanking initialRestaurants={restaurants} />
    </div>
  );


}
