import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api/artisans/register/";

// Composant réutilisable pour les champs (pour la clarté)
const Input = ({ register, name, placeholder, required, type = 'text' }) => (
    <input 
        {...register(name, { required })} 
        type={type} 
        placeholder={placeholder} 
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
    />
);

const Register = () => {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // Construction de FormData pour l'envoi de l'image
    const formData = new FormData();
    
    // Ajouter les champs de texte
    Object.keys(data).forEach(key => {
        if (key !== 'photo_profil') {
            formData.append(key, data[key]);
        }
    });

    // Ajouter le fichier image
    if (data.photo_profil && data.photo_profil.length > 0) {
      formData.append("photo_profil", data.photo_profil[0]);
    }

    try {
      await axios.post(API_URL, formData, {
        headers: {
            // Important pour l'envoi de fichiers
            'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Inscription réussie ! Vous pouvez vous connecter.");
      reset();
      navigate('/login'); 
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Erreur d’inscription !";
      
      if (errorData) {
          if (errorData.phone) errorMessage = `Téléphone: ${errorData.phone[0]}`;
          else if (errorData.password) errorMessage = `Mot de passe: ${errorData.password[0]}`;
          else if (errorData.username) errorMessage = `Nom d'utilisateur: ${errorData.username[0]}`;
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Toaster />
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">Inscription Artisan</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input register={register} name="username" placeholder="Nom d'utilisateur" required/>
          <Input register={register} name="email" placeholder="Email" required type="email"/>
          <Input register={register} name="password" placeholder="Mot de passe" required type="password"/>
          <Input register={register} name="phone" placeholder="Téléphone" required type="tel"/>
          <Input register={register} name="ville" placeholder="Ville" required/>
          <Input register={register} name="secteur" placeholder="Secteur (Ex: Plomberie)"/>
          <Input register={register} name="type_metier" placeholder="Métier (Ex: Plombier)" required/>
          
          <label className="block text-sm font-medium text-gray-700 pt-2">Photo de Profil</label>
          <input 
            {...register("photo_profil")} 
            type="file" 
            accept="image/*"
            className="w-full text-gray-700 bg-gray-50 border border-gray-300 rounded-lg p-2"
          />

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md">
            S’inscrire
          </button>
        </form>
        <div className="mt-4 text-center">
            <button onClick={() => navigate('/login')} className="text-sm text-indigo-600 hover:text-indigo-800 transition duration-150">
                Déjà un compte ? Connectez-vous.
            </button>
        </div>
      </div>
    </div>
  );
};

export default Register;