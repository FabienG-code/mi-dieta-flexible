import dynamic from "next/dynamic";
import "../lib/storageShim";

// ssr:false porque el componente usa window.storage, Blob/descargas y otras
// APIs exclusivas del navegador.
const DietApp = dynamic(() => import("../components/DietApp"), { ssr: false });

export default function Home() {
  return <DietApp />;
}
