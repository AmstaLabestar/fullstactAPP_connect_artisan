import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { realisationAPI } from '../api/api';
import { Image, Save, Trash2 } from 'lucide-react';

const BASE_API_URL = "http://localhost:8000"; // URL de base pour les images existantes

const AddEditRealisation = () => {
    const navigate = useNavigate();
    // Récupère l'ID si on est en mode édition
    const { id } = useParams(); 
    const isEditMode = Boolean(id);
    
    // Initialisation du formulaire
    const { 
        register, 
        handleSubmit, 
        setValue, 
        watch, 
        formState: { errors, isSubmitting } 
    } = useForm();
    
    const [initialImage, setInitialImage] = useState(null);
    const [loading, setLoading] = useState(isEditMode);
    
    // Surveille le champ de fichier pour l'aperçu de la nouvelle image
    const imageFile = watch('image');

    // 1. Charger les données si on est en mode édition
    useEffect(() => {
        if (!isEditMode) {
            setLoading(false);
            return;
        }

        const fetchRealisation = async () => {
            try {
                // Supposons que realisationAPI.getRealisation(id) fonctionne
                const response = await realisationAPI.getRealisation(id); 
                const data = response.data;

                // Pré-remplir les champs du formulaire avec les données existantes
                setValue('titre', data.titre);
                setValue('description', data.description);
                // Le champ fichier ne peut pas être rempli, mais on garde l'URL de l'image existante
                setInitialImage(data.image); 

            } catch (error) {
                console.error("Erreur lors du chargement de la réalisation :", error);
                toast.error("Erreur: Réalisation introuvable.");
                navigate('/dashboard/realisations');
            } finally {
                setLoading(false);
            }
        };

        fetchRealisation();
    }, [id, isEditMode, setValue, navigate]);

    // 2. Gestion de la soumission du formulaire
    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('titre', data.titre);
        formData.append('description', data.description);
        
        // Gérer le fichier image :
        // Si un nouveau fichier est sélectionné, l'ajouter au FormData
        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }
        // NOTE: Si l'utilisateur est en mode édition et ne change pas l'image, 
        // l'ancienne image est conservée côté serveur.

        try {
            if (isEditMode) {
                // Supposons que vous avez realisationAPI.updateRealisation(id, formData)
                // Vous devez ajouter cette fonction dans api.js (PATCH ou PUT)
                await realisationAPI.updateRealisation(id, formData);
                toast.success("Réalisation mise à jour avec succès !");
            } else {
                await realisationAPI.createRealisation(formData);
                toast.success("Réalisation ajoutée avec succès !");
            }
            
            navigate('/dashboard/realisations');

        } catch (error) {
            const errorData = error.response?.data;
            let errorMessage = isEditMode ? "Échec de la mise à jour." : "Échec de la création.";
            if (errorData) {
                errorMessage = Object.values(errorData).flat()[0] || errorMessage;
            }
            toast.error(errorMessage);
            console.error(isEditMode ? "Erreur MAJ réalisation:" : "Erreur ajout réalisation:", errorData);
        }
    };
    
    // 3. Affichage de l'aperçu de l'image
    const imagePreviewUrl = imageFile && imageFile.length > 0
        ? URL.createObjectURL(imageFile[0]) // Nouvelle image
        : (initialImage ? `${BASE_API_URL}${initialImage}` : null); // Image existante

    if (loading) {
        return <div className="text-center mt-5">Chargement de la réalisation...</div>;
    }

    return (
        <div className="container my-5">
            <div className="card shadow p-4 mx-auto" style={{ maxWidth: '800px' }}>
                <h2 className="card-title text-center mb-4">
                    {isEditMode ? 'Modifier la Réalisation' : 'Ajouter une Nouvelle Réalisation'}
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    
                    {/* Titre */}
                    <div className="mb-3">
                        <label className="form-label" htmlFor="titre">Titre de la Réalisation</label>
                        <input 
                            type="text" 
                            className={`form-control ${errors.titre ? 'is-invalid' : ''}`} 
                            {...register("titre", { required: "Le titre est requis" })} 
                        />
                        {errors.titre && <div className="invalid-feedback">{errors.titre.message}</div>}
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                        <label className="form-label" htmlFor="description">Description Détaillée</label>
                        <textarea 
                            rows="5"
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`} 
                            {...register("description", { required: "La description est requise" })} 
                        />
                        {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                    </div>
                    
                    {/* Image */}
                    <div className="mb-3">
                        <label className="form-label d-block" htmlFor="image">
                            {isEditMode ? 'Remplacer l\'Image' : 'Image de la Réalisation'}
                        </label>
                        <input 
                            type="file" 
                            className={`form-control ${errors.image ? 'is-invalid' : ''}`} 
                            {...register("image", { required: isEditMode ? false : "L'image est requise pour une nouvelle réalisation" })} 
                            accept="image/*"
                        />
                        {errors.image && <div className="invalid-feedback">{errors.image.message}</div>}
                    </div>
                    
                    {/* Aperçu de l'Image */}
                    {(imagePreviewUrl || initialImage) && (
                        <div className="mb-4 text-center">
                            <h6 className="text-muted">Aperçu</h6>
                            <img 
                                src={imagePreviewUrl} 
                                alt="Aperçu de la réalisation" 
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '300px', 
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }}
                            />
                        </div>
                    )}

                    {/* Bouton de Soumission */}
                    <button 
                        type="submit" 
                        className={`btn ${isEditMode ? 'btn-primary' : 'btn-success'} w-100 mt-3`} 
                        disabled={isSubmitting}
                    >
                        <Save size={20} className="me-2" />
                        {isSubmitting 
                            ? (isEditMode ? 'Mise à jour...' : 'Ajout en cours...') 
                            : (isEditMode ? 'Enregistrer les Modifications' : 'Créer la Réalisation')}
                    </button>
                    
                    {/* Bouton Annuler */}
                    <button 
                        type="button" 
                        onClick={() => navigate('/dashboard/realisations')}
                        className="btn btn-secondary w-100 mt-2" 
                    >
                        Annuler
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEditRealisation;