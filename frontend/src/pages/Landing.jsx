import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Container, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import QuoteCard from '../components/QuoteCard';
import { Autorenew, ArrowForward } from '@mui/icons-material';

export default function Landing() {
  const { isAuthenticated } = useContext(AuthContext);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRandomQuote = async () => {
    setLoading(true);
    try {
      const response = await api.get('/quotes/random');
      setQuote(response.data);
    } catch (e) {
      console.error("Failed to load quote:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomQuote();
  }, []);

  const handleToggleSaveOnLanding = async (clickedQuote) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (clickedQuote.saved) {
        await api.delete(`/quotes/unsave/${clickedQuote.id}`);
      } else {
        await api.post(`/quotes/save/${clickedQuote.id}`);
      }
      setQuote((prev) => prev ? { ...prev, saved: !prev.saved } : null);
    } catch (e) {
      console.error("Failed to update save status:", e);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontWeight: 900, 
            letterSpacing: '-1.5px', 
            mb: 2,
            background: 'linear-gradient(45deg, #b388ff 30%, #03dac6 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Daily Inspiration for Visionaries
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', mb: 4, fontWeight: 500 }}>
          Find, save, and receive daily doses of wisdom from the world's greatest minds.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {isAuthenticated ? (
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              endIcon={<ArrowForward />}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ maxWidth: '650px', mx: 'auto', mt: 8 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
          Quote of the moment
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={40} />
          </Box>
        ) : quote ? (
          <Box>
            <QuoteCard quote={quote} onToggleSave={handleToggleSaveOnLanding} />
            <Button 
              variant="text" 
              color="inherit" 
              startIcon={<Autorenew />} 
              onClick={fetchRandomQuote}
              sx={{ mt: 3, fontWeight: 600 }}
            >
              Spin Another Quote
            </Button>
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Failed to load quotes.
          </Typography>
        )}
      </Box>
    </Container>
  );
}
