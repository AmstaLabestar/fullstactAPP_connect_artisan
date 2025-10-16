import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { authHeader } from '../utils/auth';

const API_URL = "http://localhost:8000/api/artisans/realisations/";

const RealisationManager = ({ artisanId }) => {
  const [realisations, setRealisations] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // 🧭 Charger les réalisations
  const fetchRealisations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?artisan=${artisanId}`, {
        headers: authHeader(),
      });
      setRealisations(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des réalisations.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [artisanId]);

  useEffect(() => {
    if (artisanId) {
      fetchRealisations();
    }
  }, [fetchRealisations, artisanId]);

  // 📝 Création / modification
  const handleFormSubmit = async (data) => {
    const formData = new FormData();
    formData.append('titre', data.titre);
    formData.append('description', data.description);
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }

    try {
      if (editing) {
        await axios.patch(`${API_URL}${editing}/`, formData, {
          headers: {
            ...authHeader(),
            'Content-Type': undefined,
          },
        });
        toast.success("Réalisation modifiée avec succès !");
      } else {
        await axios.post(API_URL, formData, {
          headers: {
            ...authHeader(),
            'Content-Type': undefined,
          },
        });
        toast.success("Nouvelle réalisation ajoutée !");
      }

      reset();
      setEditing(null);
      setIsFormOpen(false);
      fetchRealisations();
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde.");
      console.error(err.response?.data);
    }
  };

  // 🗑️ Suppression
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réalisation ?")) return;

    try {
      await axios.delete(`${API_URL}${id}/`, { headers: authHeader() });
      toast.success("Réalisation supprimée.");
      fetchRealisations();
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
      console.error(err);
    }
  };

  // ✍️ Édition
  const handleEdit = (realisation) => {
    setEditing(realisation.id);
    setIsFormOpen(true);
    setValue('titre', realisation.titre);
    setValue('description', realisation.description);
  };

  // ❌ Annuler
  const handleCancel = () => {
    reset();
    setEditing(null);
    setIsFormOpen(false);
  };

  // 🟢 Toggle Form
  const toggleForm = () => {
    if (editing) setEditing(null);
    setIsFormOpen(!isFormOpen);
    reset();
  };

  return (
    <div className="mt-8 border p-6 rounded-lg shadow-inner">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">
        Mes Réalisations ({realisations.length})
      </h3>

      <button
        onClick={toggleForm}
        className="mb-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
      >
        {isFormOpen ? "Annuler" : "Ajouter une Réalisation"}
      </button>

      {/* Formulaire */}
      {isFormOpen && (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-4 border rounded-lg mb-6 bg-gray-50">
          <h4 className="text-xl font-medium">
            {editing ? "Modifier la Réalisation" : "Ajouter une Nouvelle Réalisation"}
          </h4>

          <div>
            <input
              {...register("titre", {
                required: "Le titre est obligatoire",
                minLength: { value: 3, message: "Minimum 3 caractères" },
              })}
              placeholder="Titre (ex: Rénovation Cuisine)"
              className="w-full border p-2 rounded"
            />
            {errors.titre && <p className="text-red-500 text-sm">{errors.titre.message}</p>}
          </div>

          <div>
            <textarea
              {...register("description")}
              placeholder="Description des travaux effectués"
              className="w-full border p-2 rounded h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {editing ? "Nouvelle Image (facultatif)" : "Image du Projet"}
            </label>
            <input type="file" {...register("image")} accept="image/*" className="w-full text-gray-700" />
          </div>

          {/* 🖼️ Image actuelle si édition */}
          {editing && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Image actuelle :</p>
              <img
                src={
                  realisations.find(r => r.id === editing)?.image
                    ? `http://localhost:8000${realisations.find(r => r.id === editing)?.image}`
                    : '/placeholder.jpg'
                }
                alt="Aperçu"
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              {editing ? "Enregistrer les modifications" : "Créer"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      {loading ? (
        <p className="text-center text-gray-500">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {realisations.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              Aucune réalisation enregistrée pour l'instant.
            </p>
          ) : (
            realisations.map((realisation) => (
              <div key={realisation.id} className="bg-white border rounded-xl shadow-md overflow-hidden">
                <img
                  src={
                    realisation.image
                      ? `http://localhost:8000${realisation.image}`
                      : '/placeholder.jpg'
                  }
                  alt={realisation.titre}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-1">{realisation.titre}</h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {realisation.description}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(realisation)}
                      className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(realisation.id)}
                      className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RealisationManager;
