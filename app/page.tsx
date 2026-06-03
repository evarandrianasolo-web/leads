import { redirect } from "next/navigation";

// La racine renvoie vers la page de pilotage (page d'accueil par défaut).
export default function Home() {
  redirect("/pilotage");
}
