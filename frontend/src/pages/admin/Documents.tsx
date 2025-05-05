import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Layout';
import UploadDocumentForm from '../../components/UploadDocumentForm';
import '../../styles/documents.css';
import axios from 'axios';

interface DocumentData {
  _id: string;
  type: string;
  nom: string;
  fichier: string;
  date_expiration: string;
  statut: string;
}

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/documents');
      setDocuments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <AdminLayout>
      <div className="container">
        <h2>Documents</h2>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          Ajouter un document
        </button>

        {showForm && (
          <div className="side-form">
            <button className="btn-close" onClick={() => setShowForm(false)}>×</button>
            <UploadDocumentForm onUploadSuccess={() => {
              fetchDocuments();
              setShowForm(false);
            }} />
          </div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Chauffeur / Véhicule</th>
              <th>Document</th>
              <th>Date d'expiration</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc._id}>
                <td>{doc.type}</td>
                <td>{doc.nom}</td>
                <td><a href={doc.fichier} target="_blank" rel="noopener noreferrer">Voir</a></td>
                <td>{new Date(doc.date_expiration).toLocaleDateString()}</td>
                <td>{doc.statut}</td>
                <td>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default DocumentsPage;
