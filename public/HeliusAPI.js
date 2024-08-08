// HeliusAPI.js
export const fetchHeliusData = async (url, apiKey) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 78ce517d-1982-48f7-b4ca-0ada28f0a326`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching Helius data:', error);
      throw error;
    }
  };
  