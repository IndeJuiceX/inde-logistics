'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerDocs() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    const fetchSwaggerSpec = async () => {
      const res = await fetch('/api/v1/docs');
      const data = await res.json();
      setSpec(data);
    };

    fetchSwaggerSpec();
  }, []);

  if (!spec) {
    return <div>Loading...</div>;
  }

  return <SwaggerUI spec={spec} />;
}
