// Simple integration test without complex imports
export const runIntegrationTest = async () => {
  try {
    console.log('🔄 Testing backend connection...');
    
    // Simple fetch to test connection
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    
    if (response.ok && data.status === 'healthy') {
      console.log('✅ Backend connection successful:', data);
      alert('✅ Frontend-Backend Integration Successful!');
      return true;
    } else {
      throw new Error('Backend returned unhealthy status');
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    alert('❌ Integration failed. Check console for details.');
    return false;
  }
};