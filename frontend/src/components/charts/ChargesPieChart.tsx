// src/components/Charts/ChargesPieChart.tsx
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ChargesPieChart: React.FC = () => {
  const [labels, setLabels] = useState<string[]>([]);
  const [dataValues, setDataValues] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('${API}/dashboard/charges-par-type');
        const types = res.data.map((item: any) => item.type);
        const values = res.data.map((item: any) => item.total);
        setLabels(types);
        setDataValues(values);
      } catch (err) {
        console.error('Erreur chargement charges par type:', err);
      }
    };

    fetchData();
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: 'Montant en DH',
        data: dataValues,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  return (
    <div>
      <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>
        🧾 Répartition des types de charges
      </h4>
      <Pie data={data} options={options} />
    </div>
  );
};

export default ChargesPieChart;