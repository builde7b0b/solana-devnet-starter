// Banner.js
import React from 'react';
import { Box, Typography, Container, AppBar, Toolbar, Button } from '@mui/material';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const Banner = () => {
  return (
    <>
    <Box
      sx={{
        position: 'relative',
        height: '350px', // Adjust height as needed
        backgroundImage: 'url("https://cryptocorsair.org/assets/dapps/7seas.webp")', // Replace with your image URL
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        zIndex: 1000, // Ensure the banner is on top
        padding: '20px',
        // marginTop: '150px',
      }}
    >
      {/* Overlay for the text to stand out */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for text readability
          zIndex: 1,
        }}
      />

      {/* Navbar inside the banner */}
      <AppBar position="absolute" color="" sx={{ top: 0, zIndex: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
           Solana Starter
          </Typography>
          <Button color="inherit">Home</Button>
          <Button  color="inherit">Features</Button>
          <Button href="https://t.me/cryptocorsaircrew" color="inherit">Contact</Button>
          <WalletMultiButton />
        </Toolbar>
      </AppBar>

     
    </Box>
    <Box sx={{ 
      position: 'relative',
      zIndex: 2,
      textAlign: 'center',
      padding: '20px',
      marginTop: '50px',
      backgroundColor: '#3e427d',
      color: '#fff',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      
    }}>
       {/* Content inside the banner */}
      <Container sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ color: '#fff', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>
         Solana Starter
        </Typography>
        <Typography variant="h6" align="center" sx={{ color: '#fff', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)' }}>
         
        </Typography>
      </Container>
    </Box>
    </>
  );
};

export default Banner;
