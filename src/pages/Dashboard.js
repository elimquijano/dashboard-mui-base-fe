import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AttachMoney,
  People,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const statsData = [
  {
    title: 'Total Earning',
    value: '$500.00',
    icon: <AttachMoney />,
    trend: '+2.5%',
    color: 'primary',
    gradient: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
  },
  {
    title: 'Total Order',
    value: '$961',
    icon: <ShoppingCart />,
    trend: '+1.3%',
    color: 'info',
    gradient: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
  },
  {
    title: 'Total Income',
    value: '$203k',
    icon: <TrendingUp />,
    trend: '+3.1%',
    color: 'success',
    gradient: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
  },
  {
    title: 'Total Users',
    value: '1,234',
    icon: <People />,
    trend: '+5.2%',
    color: 'warning',
    gradient: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
  },
];

const chartData = [
  { name: 'Jan', Investment: 100, Loss: 80, Profit: 120, Maintenance: 60 },
  { name: 'Feb', Investment: 150, Loss: 60, Profit: 180, Maintenance: 80 },
  { name: 'Mar', Investment: 80, Loss: 40, Profit: 90, Maintenance: 50 },
  { name: 'Apr', Investment: 120, Loss: 50, Profit: 140, Maintenance: 70 },
  { name: 'May', Investment: 200, Loss: 90, Profit: 250, Maintenance: 100 },
  { name: 'Jun', Investment: 180, Loss: 70, Profit: 220, Maintenance: 90 },
  { name: 'Jul', Investment: 160, Loss: 60, Profit: 200, Maintenance: 85 },
  { name: 'Aug', Investment: 140, Loss: 55, Profit: 170, Maintenance: 75 },
  { name: 'Sep', Investment: 120, Loss: 45, Profit: 150, Maintenance: 65 },
  { name: 'Oct', Investment: 100, Loss: 40, Profit: 130, Maintenance: 60 },
  { name: 'Nov', Investment: 90, Loss: 35, Profit: 110, Maintenance: 55 },
  { name: 'Dec', Investment: 110, Loss: 40, Profit: 140, Maintenance: 65 },
];

const stockData = [
  { name: 'Bajaj Finery', value: '$1839.00', change: '+10%', trend: 'up', data: [20, 25, 22, 28, 32, 30, 35] },
  { name: 'TTML', value: '$100.00', change: '-10%', trend: 'down', data: [35, 30, 32, 28, 22, 25, 20] },
  { name: 'Reliance', value: '$200.00', change: '+10%', trend: 'up', data: [15, 20, 18, 25, 28, 26, 30] },
  { name: 'Stolon', value: '$189.00', change: '-10%', trend: 'down', data: [25, 20, 22, 18, 15, 18, 12] },
];

export const Dashboard = () => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: stat.gradient,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 100,
                  height: 100,
                  background: alpha('#ffffff', 0.1),
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.8 }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  {stat.trend.startsWith('+') ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {stat.trend}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Total Growth Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total Growth
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    $2,324.00
                  </Typography>
                </Box>
                <Button variant="outlined" size="small">
                  Today
                </Button>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Investment" stackId="a" fill="#2196f3" />
                    <Bar dataKey="Loss" stackId="a" fill="#4caf50" />
                    <Bar dataKey="Profit" stackId="a" fill="#673ab7" />
                    <Bar dataKey="Maintenance" stackId="a" fill="#ff9800" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Popular Stocks */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Popular Stocks
                </Typography>
                <Button size="small" sx={{ color: theme.palette.primary.main }}>
                  View All
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stockData.map((stock, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {stock.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stock.trend === 'up' ? '10% Profit' : '10% Loss'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {stock.value}
                      </Typography>
                      <Chip
                        label={stock.change}
                        size="small"
                        color={stock.trend === 'up' ? 'success' : 'error'}
                        icon={stock.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Monthly Revenue
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="Profit" stroke={theme.palette.primary.main} fill={alpha(theme.palette.primary.main, 0.3)} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Performance Metrics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Conversion Rate</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>75%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Customer Satisfaction</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>85%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={85} color="success" sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Revenue Growth</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>65%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={65} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};