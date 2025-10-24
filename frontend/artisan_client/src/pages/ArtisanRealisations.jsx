// src/pages/ArtisanRealisations.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { realisationAPI } from '../api/api'; // Utilisez l'API qui gère les réalisations
import { Heart, MessageSquare } from 'lucide-react';

// URL de base de votre backend pour les images
const BASE_API_URL = "http://localhost:8000"; 

// Composant d'affichage d'une seule réalisation
const RealisationCard = ({ realisation }) => {
    
    // Assurez-vous que l'URL de l'image est complète
    const imageUrl = realisation.image.startsWith('http') 
        ? realisation.image 
        : `${BASE_API_URL}${realisation.image}`;

    // Logique de Like (à développer)
    const handleLike = () => {
        // Appeler realisationAPI.likeToggle(realisation.id) et mettre à jour l'UI
        toast.info(`Liking réalisation ${realisation.id} - Fonctionnalité à implémenter!`);
    };

    return (
        <div className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm border-0">
                <img 
                    src={imageUrl} // 👈 CORRECTION DE L'URL DE L'IMAGE
                    alt={realisation.titre} 
                    className="card-img-top" 
                    style={{ height: '300px', objectFit: 'cover' }} 
                    onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/400?text=Image+introuvable"; }}
                />
                <div className="card-body">
                    <h5 className="card-title">{realisation.titre}</h5>
                    <p className="card-text text-muted small">{realisation.description}</p>
                </div>
                <div className="card-footer d-flex justify-content-between bg-white border-top-0">
                    <button className="btn btn-sm btn-outline-danger" onClick={handleLike}>
                        <Heart size={18} className="me-1" fill={realisation.is_liked ? "red" : "none"} /> 
                        {realisation.likes_count || 0} Likes
                    </button>
                    <button className="btn btn-sm btn-outline-info">
                        <MessageSquare size={18} className="me-1" />
                        {realisation.comment_count || 0} Commentaires
                    </button>
                </div>
            </div>
        </div>
    );
};


const ArtisanRealisations = () => {
    const { profileId } = useParams(); 
    const [realisations, setRealisations] = useState([]);
    const [artisanName, setArtisanName] = useState(`Artisan ${profileId}`);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Récupérer les réalisations filtrées par artisan ID
        const fetchRealisations = async () => {
            setLoading(true);
            try {
                // IMPORTANT : Votre API DOIT supporter le filtre par `artisan`
                const response = await realisationAPI.getRealisationsByArtisan(profileId); 
                
                // Mettre à jour les données (utiliser results si paginé)
                setRealisations(response.data.results || response.data); 
                
                // Optionnel: Mettre à jour le nom de l'artisan
                if (response.data.artisan_name) setArtisanName(response.data.artisan_name); 

            } catch (error) {
                console.error("Erreur lors du chargement des réalisations:", error);
                toast.error("Impossible de charger les réalisations de cet artisan.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchRealisations();
    }, [profileId]);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div><p className="mt-2">Chargement des réalisations...</p></div>;
    
    return (
        <div className="container my-5">
            <h1 className="display-5 mb-4 fw-bold">Réalisations de {artisanName}</h1>
            
            {realisations.length === 0 ? (
                <div className="alert alert-info text-center">
                    Cet artisan n'a pas encore publié de réalisations.
                </div>
            ) : (
                <div className="row">
                    {realisations.map(realisation => (
                        <RealisationCard key={realisation.id} realisation={realisation} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArtisanRealisations;