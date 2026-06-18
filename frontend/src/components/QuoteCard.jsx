import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip, Tooltip, Zoom } from '@mui/material';
import { Favorite, FavoriteBorder, ContentCopy, Check } from '@mui/icons-material';

export default function QuoteCard({ quote, onToggleSave }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${quote.quoteText}" — ${quote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card sx={{ 
        position: 'relative', 
        overflow: 'visible',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(145deg, #1e202c 0%, #15171e 100%)' 
          : 'linear-gradient(145deg, #ffffff 0%, #f9f9fb 100%)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 12px 40px 0 rgba(0, 0, 0, 0.5)' 
            : '0 12px 40px 0 rgba(0, 0, 0, 0.08)',
        }
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Chip 
              label={quote.category} 
              size="small" 
              color="primary" 
              variant="outlined" 
              sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={copied ? "Copied!" : "Copy to Clipboard"}>
                <IconButton onClick={handleCopy} size="small" color="inherit">
                  {copied ? <Check color="success" /> : <ContentCopy fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title={quote.saved ? "Unsave Favorite" : "Save to Favorites"}>
                <IconButton onClick={() => onToggleSave(quote)} size="small" color="error">
                  {quote.saved ? <Favorite fontSize="medium" /> : <FavoriteBorder fontSize="medium" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography 
            variant="h5" 
            component="p" 
            sx={{ 
              fontWeight: 500, 
              fontStyle: 'italic',
              lineHeight: 1.6,
              mb: 3,
              position: 'relative',
              '&::before': {
                content: '"“"',
                position: 'absolute',
                left: '-16px',
                top: '-16px',
                fontSize: '4rem',
                opacity: 0.1,
                fontFamily: 'serif',
              }
            }}
          >
            {quote.quoteText}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              — {quote.author || 'Unknown'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
}
