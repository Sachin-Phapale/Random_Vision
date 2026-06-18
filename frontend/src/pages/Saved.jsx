import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, TextField, Button, Alert, Pagination, Paper } from '@mui/material';
import api from '../services/api';
import QuoteCard from '../components/QuoteCard';
import QuoteSkeleton from '../components/QuoteSkeleton';
import { Email, Search } from '@mui/icons-material';

export default function Saved() {
  const [quotes, setQuotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const fetchSavedQuotes = async (currentPage, queryText) => {
    setLoading(true);
    try {
      const response = await api.get(`/quotes/saved`, {
        params: {
          page: currentPage - 1,
          size: 6,
          query: queryText || undefined,
        }
      });
      setQuotes(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (e) {
      console.error("Failed to load saved quotes", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedQuotes(page, searchQuery);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSavedQuotes(1, searchQuery);
  };

  const handleToggleSaveSaved = async (clickedQuote) => {
    try {
      await api.delete(`/quotes/unsave/${clickedQuote.id}`);
      setQuotes(prev => prev.filter(q => q.id !== clickedQuote.id));
      if (quotes.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        fetchSavedQuotes(page, searchQuery);
      }
    } catch (e) {
      console.error("Failed to unsave quote", e);
    }
  };

  const handleEmailList = async () => {
    setEmailLoading(true);
    setEmailStatus('');
    try {
      await api.post('/quotes/email');
      setEmailStatus("Your favorited quotes list has been successfully emailed to you!");
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || "Failed to send email. Ensure you have saved quotes.";
      setEmailStatus(`Error: ${msg}`);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
            Saved Quotes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your personal treasury of inspiration.
          </Typography>
        </Box>
        
        {quotes.length > 0 && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Email />}
            onClick={handleEmailList}
            disabled={emailLoading}
            sx={{ alignSelf: { xs: 'stretch', md: 'auto' } }}
          >
            {emailLoading ? "Sending Email..." : "Email Me My Saved List"}
          </Button>
        )}
      </Box>

      {emailStatus && (
        <Alert severity={emailStatus.startsWith('Error:') ? 'error' : 'success'} sx={{ mb: 3 }} onClose={() => setEmailStatus('')}>
          {emailStatus}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          label="Search by quote, author, or category"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
        />
        <Button type="submit" variant="contained" startIcon={<Search />}>
          Search
        </Button>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <QuoteSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : quotes.length > 0 ? (
        <Box>
          <Grid container spacing={3}>
            {quotes.map((quote) => (
              <Grid item xs={12} sm={6} md={4} key={quote.id}>
                <QuoteCard quote={quote} onToggleSave={handleToggleSaveSaved} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, v) => setPage(v)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderStyle: 'dashed', borderWidth: '1px' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No saved quotes found.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find some interesting quotes in the Dashboard and save them to your library!
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
