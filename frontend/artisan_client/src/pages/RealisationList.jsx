// src/pages/dashboard/RealisationList.jsx (À créer)

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { realisationAPI } from '../api/api'
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const RealisationList = () => {
    const [realisations, setRealisations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyRealisations = async () => {
        setLoading(true);
        try {
            // 🚨 Supposons que votre API a un endpoint pour "mes réalisations"
            // Ex: /api/artisans/realisations/me/
            // OU si /realisations/ filtre automatiquement si l'utilisateur est connecté (auth)
            const response = await realisationAPI.getMyRealisations(); 
            setRealisations(response.data.results || response.data);
        } catch (error) {
            toast.error("Erreur lors du chargement de vos réalisations.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRealisations();
    }, []);

    // 🚨 Logique de suppression à implémenter
    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réalisation ?")) return;
        try {
            await realisationAPI.deleteRealisation(id);
            toast.success("Réalisation supprimée.");
            fetchMyRealisations(); // Recharger la liste
        } catch (error) {
            toast.error("Erreur de suppression.");
            console.error(error);
        }
    };

    if (loading) return <div className="text-center mt-5">Chargement...</div>;

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Mes Réalisations ({realisations.length})</h2>
                {/* Lien vers la page d'ajout */}
                <Link to="/dashboard/realisation/add" className="btn btn-success d-flex align-items-center">
                    <PlusCircle size={20} className="me-2" /> Ajouter une Réalisation
                </Link>
            </div>
            
            {realisations.length === 0 ? (
                <div className="alert alert-info">Vous n'avez pas encore de réalisations.</div>
            ) : (
                <div className="row">
                    {realisations.map(r => (
                        <div key={r.id} className="col-md-6 mb-4">
                            <div className="card h-100 shadow-sm">
                                {/* Affichage de l'image (attention à l'URL complète comme vu précédemment) */}
                                <img src={`http://localhost:8000${r.image}`} alt={r.titre} style={{ height: '200px', objectFit: 'cover' }} className="card-img-top" />
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">{r.titre}</h5>
                                    <div>
                                        {/* Lien vers l'édition */}
                                        <Link to={`/dashboard/realisation/edit/${r.id}`} className="btn btn-sm btn-primary me-2">
                                            <Edit size={16} />
                                        </Link>
                                        <button onClick={() => handleDelete(r.id)} className="btn btn-sm btn-danger">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RealisationList;