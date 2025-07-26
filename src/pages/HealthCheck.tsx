import React from 'react';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: 'ok' | 'error';
    storage: 'ok' | 'error';
    external_apis: 'ok' | 'error';
  };
}

const HealthCheck: React.FC = () => {
  const [health, setHealth] = React.useState<HealthStatus | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkHealth = async () => {
      try {
        // Simulate health check
        const healthData: HealthStatus = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: performance.now(),
          version: '1.0.0',
          checks: {
            database: 'ok',
            storage: 'ok',
            external_apis: 'ok',
          },
        };
        
        setHealth(healthData);
      } catch (error) {
        setHealth({
          status: 'error',
          timestamp: new Date().toISOString(),
          uptime: performance.now(),
          version: '1.0.0',
          checks: {
            database: 'error',
            storage: 'error',
            external_apis: 'error',
          },
        });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking system health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Health Check</h1>
        
        {health && (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className={`p-6 rounded-lg border ${
              health.status === 'ok' 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  health.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <h2 className="text-xl font-semibold">
                  System Status: {health.status.toUpperCase()}
                </h2>
              </div>
              <p className="mt-2 text-muted-foreground">
                Last checked: {new Date(health.timestamp).toLocaleString()}
              </p>
            </div>

            {/* System Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-semibold text-sm text-muted-foreground">Version</h3>
                <p className="text-lg font-bold">{health.version}</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-semibold text-sm text-muted-foreground">Uptime</h3>
                <p className="text-lg font-bold">{Math.round(health.uptime / 1000)}s</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-semibold text-sm text-muted-foreground">Environment</h3>
                <p className="text-lg font-bold">{import.meta.env.MODE}</p>
              </div>
            </div>

            {/* Service Checks */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Service Checks</h3>
              {Object.entries(health.checks).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between p-3 bg-card rounded border">
                  <span className="font-medium capitalize">{service.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      status === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthCheck;