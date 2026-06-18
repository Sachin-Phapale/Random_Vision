import React from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';

export default function QuoteSkeleton() {
  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>
        <Skeleton variant="text" width="100%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="85%" height={32} sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Skeleton variant="text" width={120} height={24} />
        </Box>
      </CardContent>
    </Card>
  );
}
