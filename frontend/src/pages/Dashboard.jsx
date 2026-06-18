import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, Button, Grid, Paper, Alert } from '@mui/material';
import api from '../services/api';
import QuoteCard from '../components/QuoteCard';
import QuoteSkeleton from '../components/QuoteSkeleton';
import { Autorenew } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [quote, setQuote] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRandomQuote = async () => {
    setQuoteLoading(true);
    setError('');
    try {
      const response = await api.get('/quotes/random');
      setQuote(response.data);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch quote.");
    } finally {
      setQuoteLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecsLoading(true);
    try {
      const response = await api.get('/quotes/recommend?limit=3');
      setRecommendations(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setRecsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomQuote();
    fetchRecommendations();
  }, []);

  const handleToggleSaveMain = async (clickedQuote) => {
    try {
      if (clickedQuote.saved) {
        await api.delete(`/quotes/unsave/${clickedQuote.id}`);
      } else {
        await api.post(`/quotes/save/${clickedQuote.id}`);
      }
      
      if (quote && quote.id === clickedQuote.id) {
        setQuote(prev => prev ? { ...prev, saved: !prev.saved } : null);
      }

      setRecommendations(prev => prev.map(q => q.id === clickedQuote.id ? { ...q, saved: !q.saved } : q));
      fetchRecommendations();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here is your daily dose of visual intelligence and inspiration.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Your Inspiration Spinner
          </Typography>

          {quoteLoading ? (
            <QuoteSkeleton />
          ) : quote ? (
            <Box>
              <QuoteCard quote={quote} onToggleSave={handleToggleSaveMain} />
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  startIcon={<Autorenew />}
                  onClick={fetchRandomQuote}
                  sx={{ px: 4 }}
                >
                  Spin Another Quote
                </Button>
              </Box>
            </Box>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No quote found.
              </Typography>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Recommended For You
          </Typography>

          {recsLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <QuoteSkeleton />
              <QuoteSkeleton />
            </Box>
          ) : recommendations.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {recommendations.map((rec) => (
                <QuoteCard key={rec.id} quote={rec} onToggleSave={handleToggleSaveMain} />
              ))}
            </Box>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderWidth: '1px' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                No recommendations yet.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Save some quotes to train our recommendation engine.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
