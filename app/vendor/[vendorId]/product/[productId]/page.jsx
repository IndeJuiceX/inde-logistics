'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getFileFromS3 } from '@/services/external/s3';
import SingleProductView from '@/components/vendor/product/SingleProductView';

export default function ProductDetailsPage({ params }) {
  const vendorId = params.vendorId;
  const productId = params.productId;

  return (
    <SingleProductView vendorId={vendorId} productId={productId} />
  );
}
