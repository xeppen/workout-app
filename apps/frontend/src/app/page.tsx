// src/app/page.tsx
'use client';

import Link from 'next/link';
import { Card, CardContent, Typography, Grid } from '@mui/material';

export default function Home() {
  return (
    <div className="space-y-6">
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to Workout App
      </Typography>
      <Typography variant="h5" component="p" gutterBottom>
        Track your workouts and monitor your progress
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Link href="/workouts" passHref>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent>
                <Typography variant="h4" component="h2">
                  Workouts
                </Typography>
                <Typography variant="body1">
                  Plan and track your workout sessions
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
        <Grid item xs={12} md={6}>
          <Link href="/progress" passHref>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent>
                <Typography variant="h4" component="h2">
                  Progress
                </Typography>
                <Typography variant="body1">
                  View your fitness progress over time
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
        <Grid item xs={12} md={6}>
          <Link href="/exercises" passHref>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent>
                <Typography variant="h4" component="h2">
                  Exercises
                </Typography>
                <Typography variant="body1">
                  Manage your exercise library
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      </Grid>
    </div>
  );
}
