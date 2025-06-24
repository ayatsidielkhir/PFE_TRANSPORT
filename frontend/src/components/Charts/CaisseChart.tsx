import React from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import type { ChartOptions } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  entrees: number[];
  sorties: number[];
  labels: string[];
}

const CaisseChart: React.FC<Props> = ({ entrees, sorties, labels }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Entrées',
        data: entrees,
        backgroundColor: '#4caf50',
      },
      {
        label: 'Sorties',
        data: sorties,
        backgroundColor: '#f44336',
      }
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'État de la caisse (Entrées vs Sorties)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Montant en DH'
        }
      }
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        💰 Graphique des entrées et sorties de caisse
      </Typography>
      <Bar data={data} options={options} />
    </Box>
  );
};

export default CaisseChart;
