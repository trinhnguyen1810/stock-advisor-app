import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'Stock Trend Causality + AI Investment Advisor © '}
          {new Date().getFullYear()}
          {'. '}
          <Typography variant="caption" display="block" color="text.secondary" align="center" sx={{ mt: 1 }}>
            This application is for demonstration purposes only. Not financial advice.
          </Typography>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;