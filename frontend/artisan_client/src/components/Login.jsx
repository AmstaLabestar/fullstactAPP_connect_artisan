import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { setToken } from "../utils/auth";

const Login = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:8000/api/artisans/login/", {
        phone: data.phone,
        password: data.password
      });
      setToken(res.data.access);
      toast.success("Connexion réussie !");
      window.location.href = "/dashboard"; // redirection vers la route protégée
    } catch (err) {
      toast.error("Numéro ou mot de passe invalide !");
      console.log(err.response?.data);
    }
  };

  return (
    <div className="container">
      <Toaster />
      <h2>Connexion Artisan</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("phone")} placeholder="Téléphone" required />
        <input {...register("password")} type="password" placeholder="Mot de passe" required />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default Login;
