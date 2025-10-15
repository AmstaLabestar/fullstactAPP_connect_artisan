import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Register = () => {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post("http://localhost:8000/api/artisans/register/", data);
      toast.success("Inscription réussie !");
      reset();
    } catch (err) {
      toast.error("Erreur d’inscription !");
      console.log(err.response?.data);
    }
  };

  return (
    <div className="container">
      <Toaster />
      <h2>Inscription Artisan</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("username")} placeholder="Nom d'utilisateur" required />
        <input {...register("email")} placeholder="Email" required />
        <input {...register("password")} type="password" placeholder="Mot de passe" required />
        <input {...register("phone")} placeholder="Téléphone" required />
        <input {...register("ville")} placeholder="Ville" required />
        <input {...register("secteur")} placeholder="Secteur" />
        <input {...register("type_metier")} placeholder="Métier" required />
        <button type="submit">S’inscrire</button>
      </form>
    </div>
  );
};

export default Register;
