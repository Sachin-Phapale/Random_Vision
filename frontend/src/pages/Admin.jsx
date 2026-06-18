import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Alert, Pagination, useTheme } from '@mui/material';
import { People, FormatQuote, Favorite, Edit, Delete, Add, Search } from '@mui/icons-material';
import api from '../services/api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const theme = useTheme();

  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  const [quotes, setQuotes] = useState([]);
  const [quotesPage, setQuotesPage] = useState(1);
  const [quotesTotalPages, setQuotesTotalPages] = useState(1);
  const [quotesSearch, setQuotesSearch] = useState('');

  const [openQuoteDialog, setOpenQuoteDialog] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteCategory, setQuoteCategory] = useState('');
  const [crudError, setCrudError] = useState('');
  const [crudSuccess, setCrudSuccess] = useState('');

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  const fetchUsers = async (page) => {
    try {
      const response = await api.get('/admin/users', {
        params: { page: page - 1, size: 8 }
      });
      setUsers(response.data.content);
      setUsersTotalPages(response.data.totalPages);
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  };

  const fetchQuotes = async (page, query) => {
    try {
      const response = await api.get('/admin/quotes', {
        params: {
          page: page - 1,
          size: 8,
          query: query || undefined,
        }
      });
      setQuotes(response.data.content);
      setQuotesTotalPages(response.data.totalPages);
    } catch (e) {
      console.error("Failed to fetch quotes", e);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchStats();
    } else if (activeTab === 1) {
      fetchUsers(usersPage);
    } else if (activeTab === 2) {
      fetchQuotes(quotesPage, quotesSearch);
    }
  }, [activeTab, usersPage, quotesPage]);

  const handleSearchQuotes = (e) => {
    e.preventDefault();
    setQuotesPage(1);
    fetchQuotes(1, quotesSearch);
  };

  const handleOpenAddQuote = () => {
    setEditingQuote(null);
    setQuoteText('');
    setQuoteAuthor('');
    setQuoteCategory('');
    setCrudError('');
    setCrudSuccess('');
    setOpenQuoteDialog(true);
  };

  const handleOpenEditQuote = (quote) => {
    setEditingQuote(quote);
    setQuoteText(quote.quoteText);
    setQuoteAuthor(quote.author || '');
    setQuoteCategory(quote.category);
    setCrudError('');
    setCrudSuccess('');
    setOpenQuoteDialog(true);
  };

  const handleCloseQuoteDialog = () => {
    setOpenQuoteDialog(false);
  };

  const handleSaveQuote = async (e) => {
    e.preventDefault();
    setCrudError('');
    setCrudSuccess('');
    const payload = { quoteText, author: quoteAuthor || 'Unknown', category: quoteCategory };

    try {
      if (editingQuote) {
        await api.put(`/admin/quotes/${editingQuote.id}`, payload);
        setCrudSuccess("Quote updated successfully!");
      } else {
        await api.post('/admin/quotes', payload);
        setCrudSuccess("New quote created successfully!");
      }
      setTimeout(() => {
        handleCloseQuoteDialog();
        fetchQuotes(quotesPage, quotesSearch);
      }, 1500);
    } catch (err) {
      console.error(err);
      setCrudError(err.response?.data?.message || "Failed to save quote.");
    }
  };

  const handleDeleteQuote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quote?")) return;
    try {
      await api.delete(`/admin/quotes/${id}`);
      fetchQuotes(quotesPage, quotesSearch);
    } catch (err) {
      console.error(err);
      alert("Failed to delete quote.");
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>
        Admin Panel
      </Typography>

      <Tabs 
        value={activeTab} 
        onChange={(e, v) => setActiveTab(v)} 
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}
      >
        <Tab label="System Stats" />
        <Tab label="Manage Users" />
        <Tab label="Manage Quotes" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1c1e27' : '#f0f2f5' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <People color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.totalUsers || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Registered Users</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1c1e27' : '#f0f2f5' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormatQuote color="secondary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.totalQuotes || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Quotes In Library</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1c1e27' : '#f0f2f5' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Favorite color="error" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.totalSavedQuotes || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Favorited Quotes</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Recent Activity Logs
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell align="right">Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 600 }}>{log.username}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell align="right" color="text.secondary">{log.timestamp}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No recent activities found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell align="right">Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.enabled ? (
                        <Alert severity="success" icon={false} sx={{ py: 0, px: 1, display: 'inline-flex' }}>Active</Alert>
                      ) : (
                        <Alert severity="warning" icon={false} sx={{ py: 0, px: 1, display: 'inline-flex' }}>Inactive</Alert>
                      )}
                    </TableCell>
                    <TableCell>{user.roles.join(', ')}</TableCell>
                    <TableCell align="right" color="text.secondary">{user.createdAt.substring(0,10)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {usersTotalPages > 1 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination count={usersTotalPages} page={usersPage} onChange={(e, v) => setUsersPage(v)} color="primary" />
            </Box>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Box component="form" onSubmit={handleSearchQuotes} sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
              <TextField 
                label="Search Quotes" 
                variant="outlined" 
                size="small" 
                fullWidth
                value={quotesSearch}
                onChange={(e) => setQuotesSearch(e.target.value)}
              />
              <Button type="submit" variant="contained" startIcon={<Search />}>Search</Button>
            </Box>
            <Button variant="contained" color="secondary" startIcon={<Add />} onClick={handleOpenAddQuote}>
              Add Quote
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Quote text</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>{quote.id}</TableCell>
                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {quote.quoteText}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{quote.author}</TableCell>
                    <TableCell>{quote.category}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenEditQuote(quote)} color="primary" size="small"><Edit /></IconButton>
                      <IconButton onClick={() => handleDeleteQuote(quote.id)} color="error" size="small"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {quotesTotalPages > 1 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination count={quotesTotalPages} page={quotesPage} onChange={(e, v) => setQuotesPage(v)} color="primary" />
            </Box>
          )}

          <Dialog open={openQuoteDialog} onClose={handleCloseQuoteDialog} fullWidth maxWidth="sm">
            <Box component="form" onSubmit={handleSaveQuote}>
              <DialogTitle>{editingQuote ? "Edit Quote" : "Add New Quote"}</DialogTitle>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                {crudError && <Alert severity="error">{crudError}</Alert>}
                {crudSuccess && <Alert severity="success">{crudSuccess}</Alert>}
                
                <TextField
                  label="Quote Text"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  required
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                />
                <TextField
                  label="Author"
                  variant="outlined"
                  fullWidth
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                  placeholder="Unknown"
                />
                <TextField
                  label="Category"
                  variant="outlined"
                  fullWidth
                  required
                  value={quoteCategory}
                  onChange={(e) => setQuoteCategory(e.target.value)}
                />
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleCloseQuoteDialog} color="inherit">Cancel</Button>
                <Button type="submit" variant="contained" color="primary">Save</Button>
              </DialogActions>
            </Box>
          </Dialog>
        </Box>
      )}
    </Container>
  );
}
