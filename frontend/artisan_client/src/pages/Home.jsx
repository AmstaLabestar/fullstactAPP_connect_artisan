// src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { publicAPI } from '../api/api';
import { Search, MapPin, Phone, Briefcase, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 👈 IMPORT NÉCESSAIRE

// Composant de Carte individuel (pour le style moderne/dynamique)
const ArtisanCard = ({ artisan }) => {
  const navigate = useNavigate(); // 👈 UTILISATION DU HOOK

  // Utilisez l'ID pour la navigation (plus propre que le téléphone)
  const profileIdentifier = artisan.id || artisan.phone; 

  const handleViewRealisations = () => {
    // Redirige vers la nouvelle route
    navigate(`/artisan/${profileIdentifier}/realisations`);
  };

  // Rendre une carte simple et cliquable
  return (
    // Utilisation de la classe 'shadow-lg' et 'card-hover-effect' pour l'animation UX
    <div 
      className="col-md-4 col-lg-3 mb-4" 
      onClick={handleViewRealisations} // 👈 GESTIONNAIRE DE CLIC SUR TOUTE LA CARTE
    >
      <div 
        className="card h-100 border-0 shadow-lg card-hover-effect" 
        style={{ borderRadius: '15px', overflow: 'hidden', cursor: 'pointer' }}
      >
        <div className="card-body p-0">
          
          {/* Photo de profil et Overlay pour un effet moderne */}
          <div className="position-relative">
            {artisan.photo_profil ? (
              <img 
                src={artisan.photo_profil} 
                alt={artisan.username} 
                className="img-fluid w-100" 
                style={{ height: '200px', objectFit: 'cover' }}
              />
            ) : (
              <div 
                className="d-flex align-items-center justify-content-center bg-secondary text-white" 
                style={{ height: '200px', fontSize: '3rem' }}
              >
                <User size={80} />
              </div>
            )}
            <div className="position-absolute bottom-0 start-0 w-100 p-2 text-white" 
                 style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))' }}>
                <h5 className="card-title mb-0">{artisan.username}</h5>
            </div>
          </div>
          
          {/* Détails */}
          <div className="p-3">
            <div className="d-flex align-items-center mb-2">
              <Phone size={16} className="me-2 text-primary" />
              <p className="mb-0 text-muted">{artisan.phone}</p>
            </div>
            
            <div className="d-flex align-items-center mb-2">
              <MapPin size={16} className="me-2 text-primary" />
              <p className="mb-0">{artisan.ville} {artisan.secteur && `(${artisan.secteur})`}</p>
            </div>

            <div className="d-flex align-items-start mb-2">
              <Briefcase size={16} className="me-2 text-primary flex-shrink-0 mt-1" />
              <div className="d-flex flex-wrap">
                {artisan.metiers && artisan.metiers.slice(0, 3).map((metier, index) => (
                  <span key={index} className="badge bg-info text-dark me-1 mb-1">
                    {metier.nom}
                  </span>
                ))}
                {artisan.metiers && artisan.metiers.length > 3 && (
                    <span className="badge bg-light text-muted">+{artisan.metiers.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-footer bg-white border-0 text-end">
          {/* Remplacé le <a> par un <button> pour le clic explicite */}
          <button onClick={handleViewRealisations} className="btn btn-link text-primary text-decoration-none fw-bold p-0">
            Voir les réalisations <ChevronRight size={16} />
          </button>
        </div>
      </div>
      {/* CSS pour l'effet de survol (inchangé) */}
      <style>{`
        .card-hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};


const Home = () => {
  const [artisans, setArtisans] = useState([]);
  const [metiers, setMetiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit } = useForm();
  
  // 1. Fonction de récupération des données avec filtres
  const fetchArtisans = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await publicAPI.getArtisans(filters);
      setArtisans(response.data.results || response.data); 
    } catch (error) {
      console.error("Erreur chargement artisans:", error);
      toast.error("Erreur lors du chargement des artisans.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Chargement initial et métiers (CORRIGÉ contre le TypeError: metiers.map)
  useEffect(() => {
    fetchArtisans();
    const fetchMetiersList = async () => {
      try {
        const response = await publicAPI.getMetiers();
        
        // Extrait le tableau 'results' si la réponse est paginée
        const metiersData = response.data.results || response.data;
        
        if (Array.isArray(metiersData)) {
            setMetiers(metiersData);
        } else {
            console.error("L'API /metiers/ n'a pas retourné un tableau de résultats.");
            setMetiers([]);
        }
        
      } catch (error) {
        console.error("Erreur chargement métiers:", error);
        toast.error("Impossible de charger la liste des métiers.");
      }
    };
    fetchMetiersList();
  }, []);

  // 3. Soumission du formulaire de recherche/filtre
  const onSubmit = (data) => {
    const filters = {
      search: data.search,
      ville: data.ville,
      metier: data.metier,
    };
    
    const validFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
    );
    
    fetchArtisans(validFilters);
  };

  return (
    <div className="container my-5">
      <header className="text-center mb-5 p-4 bg-light rounded-3 shadow-sm">
        <h1 className="display-4 fw-bold text-primary">Trouvez votre Artisan Qualifié</h1>
        <p className="lead">Recherchez parmi nos professionnels vérifiés par métier, ville ou nom.</p>
      </header>

      {/* Formulaire de Recherche et Filtre (inchangé) */}
      <div className="card shadow-lg mb-5 border-0" style={{ borderRadius: '15px' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="row g-3 align-items-end">
            
            {/* Recherche générale (nom/ville/métier) */}
            <div className="col-md-5">
              <label className="form-label fw-bold">Recherche par mot-clé</label>
              <div className="input-group">
                <span className="input-group-text"><Search size={20} /></span>
                <input 
                  type="text" 
                  className="form-control form-control-lg" 
                  placeholder="Nom, ville, ou métier..."
                  {...register("search")} 
                />
              </div>
            </div>

            {/* Filtre par Ville (exacte ou partielle) */}
            <div className="col-md-3">
              <label className="form-label fw-bold">Ville</label>
              <input 
                type="text" 
                className="form-control form-control-lg" 
                placeholder="Ex: Paris"
                {...register("ville")} 
              />
            </div>

            {/* Filtre par Métier */}
            <div className="col-md-3">
              <label className="form-label fw-bold">Métier Spécifique</label>
              <select 
                className="form-select form-select-lg"
                {...register("metier")}
              >
                <option value="">Tous les métiers</option>
                {Array.isArray(metiers) && metiers.map(metier => (
                  <option key={metier.id} value={metier.nom}>
                    {metier.nom}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Bouton de soumission */}
            <div className="col-md-1">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100" 
                disabled={loading}
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Résultat de la Liste des Artisans (inchangé) */}
      <h2 className="mb-4 fw-bold">Résultats ({artisans.length})</h2>
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Recherche des artisans en cours...</p>
        </div>
      ) : artisans.length === 0 ? (
        <div className="alert alert-warning text-center" role="alert">
          Aucun artisan trouvé correspondant à vos critères.
        </div>
      ) : (
        <div className="row">
          {artisans.map(artisan => (
            <ArtisanCard key={artisan.phone || artisan.id} artisan={artisan} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;