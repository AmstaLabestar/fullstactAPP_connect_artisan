import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import RealisationForm from "./RealisationForm";

export default function RealisationManager() {
  const [realisations, setRealisations] = useState([]);
  const [editing, setEditing] = useState(null);

  const fetchRealisations = async () => {
    try {
      const res = await axiosInstance.get("/api/realisations/");
      setRealisations(res.data);
    } catch { toast.error("Erreur chargement réalisations"); }
  };

  useEffect(() => { fetchRealisations(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ?")) return;
    try {
      await axiosInstance.delete(`/api/realisations/${id}/`);
      toast.success("Réalisations supprimée");
      fetchRealisations();
    } catch { toast.error("Erreur suppression"); }
  };

  return (
    <div className="card p-3 shadow-sm">
      <h3 className="h5 mb-3">Mes Réalisations</h3>
      <RealisationForm onSuccess={fetchRealisations} editing={editing} setEditing={setEditing} />

      <div className="list-group mt-3">
        {realisations.map(r => (
          <div key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">{r.titre}</h6>
              <p className="mb-0">{r.description}</p>
            </div>
            <div className="btn-group">
              <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(r)}>Éditer</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
