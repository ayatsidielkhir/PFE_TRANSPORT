import React from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Typography, Box } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: {
    mois: string;
    revenu: number;
    depenses: number;
    revenuNet: number;
  }[];
}

const ChiffreAffaireChart: React.FC<Props> = ({ data }) => {
  const labels = data.map(d => d.mois);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenus',
        data: data.map(d => d.revenu),
        borderColor: '#42a5f5',
        backgroundColor: '#42a5f5',
        tension: 0.4,
      },
      {
        label: 'Dépenses',
        data: data.map(d => d.depenses),
        borderColor: '#ef5350',
        backgroundColor: '#ef5350',
        tension: 0.4,
      },
      {
        label: 'Solde net',
        data: data.map(d => d.revenuNet),
        borderColor: '#66bb6a',
        backgroundColor: '#66bb6a',
        tension: 0.4,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      title: {
        display: true,
        text: 'Chiffre d’affaires (Revenus – Dépenses)',
        font: { size: 16 }
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
      Chiffre d'affaires mensuel
      </Typography>
      <Line data={chartData} options={options} />
    </Box>
  );
};

export default ChiffreAffaireChart;
