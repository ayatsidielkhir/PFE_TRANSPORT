import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Typography, Card } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: {
    mois: string;
    revenuNet: number;
  }[];
}

const ChiffreAffaireChart: React.FC<Props> = ({ data }) => {
  const labels = data.map(d => d.mois);
  const revenus = data.map(d => d.revenuNet);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Chiffre d’affaires (net)',
        data: revenus,
        backgroundColor: '#42a5f5',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Chiffre d’affaires mensuel net',
      },
    },
  };

  return (
    <Card sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        📊 Chiffre d’affaires
      </Typography>
      <Box height={300}>
        <Bar data={chartData} options={options} />
      </Box>
    </Card>
  );
};

export default ChiffreAffaireChart;
