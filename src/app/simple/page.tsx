// Simple page with NO Clerk, NO database, NO external dependencies
export default function SimplePage() {
  return (
    <html>
      <body>
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f0f0f0',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#333', fontSize: '3rem', marginBottom: '20px' }}>
            ✅ DormChef is LIVE!
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>
            This simple page proves Vercel deployment is working.
          </p>
          <p style={{ fontSize: '1rem', color: '#999', marginTop: '20px' }}>
            No Clerk authentication needed • No database connection needed
          </p>
        </div>
      </body>
    </html>
  );
}